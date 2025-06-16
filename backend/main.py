from fastapi import FastAPI, File, UploadFile, Form, HTTPException, Query, Header
from fastapi.middleware.cors import CORSMiddleware
from extract_pdf import extract_pdf
from llmcall import fetch_pdf_extracted_data
from parse_md_file import parse_markdown
from db import users, report_data
from bson import ObjectId
from typing import List, Optional
from collections import defaultdict
import os
import shutil
import json

app = FastAPI()

# Allow all origins (development only)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # change to specific domains in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)            

# Example data model for request body
UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)
# Root route
@app.get("/")
def read_root():
    return {"message": "Welcome to FastAPI!"}

# GET route with path parameter
@app.get("/items/{item_id}")
def read_item(item_id: int, q: str = None):
    return {"item_id": item_id, "query": q}


async def insert_user_data(res_json):
     #save the report data in db
    inserted_user = await users.insert_one(res_json['patient_details'])
    res = str(inserted_user.inserted_id)
    print(res, "res from db")
    return res

async def insert_report_data(data):
    insert_report_data = await report_data.insert_many(data)
    return str(insert_report_data.inserted_ids)



def convert_object_ids(obj):
    if isinstance(obj, list):
        return [convert_object_ids(item) for item in obj]
    elif isinstance(obj, dict):
        return {k: convert_object_ids(v) for k, v in obj.items()}
    elif isinstance(obj, ObjectId):
        return str(obj)
    else:
        return obj


@app.get("/reports/{auth_userid}")
async def get_all_reports(auth_userid: str):
    reports_data_res = report_data.find({"auth_userid": auth_userid})
    print(reports_data_res)  # This will just print a cursor object, not the actual data
    reports = []
    async for report in reports_data_res:
        report["_id"] = str(report["_id"])  # convert ObjectId to string
        reports.append(report)

    return reports

# POST route with request body
@app.post("/extract/")
async def process_pdf(
    userId: str = Form(...),
    title: str = Form(...),
    notes: str = Form(...),
    file: UploadFile = File(...)
):
    try:
        # Validate file type
        if not file.filename.endswith(".pdf"):
            return {"error": "Only PDF files are allowed"}

        file_path = os.path.join(UPLOAD_DIR, file.filename)

        # Save the uploaded file to disk
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        # Extract PDF content
        print("🔍 Extracting PDF...")
        extract_pdf_response = extract_pdf(file_path)
        print(f"PDF extraction result: {type(extract_pdf_response)}")
        
        if not extract_pdf_response:
            return {"error": "Failed to extract content from PDF"}

        # Get LLM response
        print("🤖 Calling LLM...")
        resp_from_llm = await fetch_pdf_extracted_data(extract_pdf_response)
        print(f"LLM response type: {type(resp_from_llm)}")
        
        if not resp_from_llm:
            return {"error": "Failed to get response from LLM"}

        # Parse LLM response JSON
        try:
            resp_json = json.loads(resp_from_llm)
            print("✅ LLM response parsed successfully")
        except json.JSONDecodeError as e:
            print(f"❌ Failed to parse LLM response as JSON: {e}")
            return {"error": "Invalid JSON response from LLM"}

        # Extract choices content
        if 'choices' not in resp_json or not resp_json['choices']:
            return {"error": "No choices found in LLM response"}
        
        choices = resp_json['choices'][0]['message']['content']
        print(f"📝 Choices content preview: {choices[:200] if choices else 'Empty'}...")
        
        if not choices or not choices.strip():
            return {"error": "Empty content from LLM"}

        # Parse markdown
        print("📄 Parsing markdown...")
        parsed_blocks = parse_markdown(choices)
        print(f"Parsed blocks type: {type(parsed_blocks)}")
        print(f"Number of blocks: {len(parsed_blocks) if parsed_blocks else 0}")
        
        # Debug: Print the structure of parsed_blocks
        if parsed_blocks:
            for i, block in enumerate(parsed_blocks):
                print(f"Block {i}: {type(block)} - Keys: {block.keys() if isinstance(block, dict) else 'Not a dict'}")
                if isinstance(block, dict) and 'content' in block:
                    content_preview = block['content'][:100] if block['content'] else 'Empty'
                    print(f"  Content preview: {repr(content_preview)}")

        # Validate parsed blocks
        if not parsed_blocks or len(parsed_blocks) == 0:
            return {"error": "No blocks parsed from markdown"}
        
        if not isinstance(parsed_blocks[0], dict) or 'content' not in parsed_blocks[0]:
            return {"error": "Invalid structure in parsed blocks"}
        
        # Get and validate JSON content
        json_content = parsed_blocks[0]['content']
        if not json_content or not json_content.strip():
            return {"error": "Empty JSON content in first parsed block"}
        
        print(f"🔍 JSON content to parse: {repr(json_content[:200])}")
        
        # Parse the final JSON
        try:
            res_json = json.loads(json_content.strip())
            print("✅ Final JSON parsed successfully")
            print(f"JSON keys: {res_json.keys() if isinstance(res_json, dict) else 'Not a dict'}")
        except json.JSONDecodeError as e:
            print(f"❌ Failed to parse final JSON: {e}")
            print(f"Problematic content: {repr(json_content)}")
            return {"error": f"Invalid JSON in parsed content: {str(e)}"}

        # Validate required structure
        if not isinstance(res_json, dict):
            return {"error": "Expected JSON object from parsed content"}
        
        if 'test_categories' not in res_json:
            return {"error": "Missing 'test_categories' in parsed JSON", "available_keys": list(res_json.keys())}

        # Insert user data
        print("💾 Inserting user data...")
        res_from_db = await insert_user_data(res_json)

        # Prepare reports data
        reports_to_insert = []
        for key, value in res_json['test_categories'].items():
            if not isinstance(value, dict):
                print(f"⚠️ Warning: test_category '{key}' is not a dict: {type(value)}")
                continue
                
            value["auth_userid"] = userId
            value["db_userid"] = res_from_db
            value["report_metadata"] = res_json.get('report_metadata', {})
            reports_to_insert.append(value)

        print(f"📊 Prepared {len(reports_to_insert)} reports for insertion")

        # Uncomment when ready to insert reports
        if reports_to_insert:
            result = await insert_report_data(reports_to_insert)
            print(f"Reports insertion result: {result}")

        # Prepare response
        response = {
            "title": title, 
            "notes": notes, 
            "reports_data": res_json, 
            "raw": parsed_blocks
        }
        cleaned_response = convert_object_ids(response)
        
        return {
            "response": cleaned_response,
            "user": res_from_db
        }

    except Exception as e:
        print(f"🚨 Unexpected error in process_pdf: {e}")
        import traceback
        traceback.print_exc()
        return {"error": f"Internal server error: {str(e)}"}

    finally:
        # Clean up uploaded file
        try:
            if os.path.exists(file_path):
                os.remove(file_path)
                print(f"🗑️ Cleaned up temporary file: {file_path}")
        except Exception as e:
            print(f"⚠️ Failed to clean up file {file_path}: {e}")


@app.get("/report-detail/{id}")
async def get_report_detail_and_values(
    id: str,
    auth_userid: str = Query(...),
    # db_userid: str = Query(...)
):
    # Step 1: Get the report by ID (only used for 'data' in the response)
    try:
        object_id = ObjectId(id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid report ID")

    report = await report_data.find_one({"_id": object_id})
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")

    report["_id"] = str(report["_id"])  # for JSON serialization

    # Step 2: Extract parameter_tags from that report's 'tests' array
    tests = report.get("tests", [])
    tag_list = [test.get("parameter_tag") for test in tests if test.get("parameter_tag")]

    if not tag_list:
        return {
            "message": "Report found, but no parameter_tags present.",
            "data": report,
            "parameter_values": {}
        }

    # Step 3: Fetch historical values for those tags using auth_userid and db_userid
    pipeline = [
        {
            "$match": {
                "auth_userid": auth_userid,
                # "db_userid": db_userid
            }
        },
        { "$unwind": "$tests" },
        {
            "$match": {
                "tests.parameter_tag": { "$in": tag_list }
            }
        },
        {
            "$project": {
                "_id": 0,
                "parameter_tag": "$tests.parameter_tag",
                "value": "$tests.value",
                "report_date": "$report_metadata.report_date"
            }
        }
    ]

    cursor = report_data.aggregate(pipeline)
    result_map = defaultdict(list)

    async for doc in cursor:
        tag = doc.pop("parameter_tag")
        result_map[tag].append(doc)

    return {
        "message": "Report found and parameter values fetched successfully.",
        "data": report,
        "parameter_values": result_map
    }