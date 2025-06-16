# from markdown_it import MarkdownIt
# from markdown_it.token import Token
# from typing import List, Dict, Union

# MarkdownBlock = Union[
#     Dict[str, Union[str, int]],
#     Dict[str, Union[str, List[str], bool]]
# ]

# def parse_markdown(md: str) -> List[MarkdownBlock]:
#     md_parser = MarkdownIt()
#     tokens: List[Token] = md_parser.parse(md)
#     blocks: List[MarkdownBlock] = []

#     list_buffer = []
#     is_ordered_list = False

#     i = 0
#     while i < len(tokens):
#         token = tokens[i]

#         if token.type == 'heading_open':
#             level = int(token.tag[1])
#             content = tokens[i + 1].content if i + 1 < len(tokens) else ''
#             blocks.append({"type": "heading", "level": level, "content": content})
#             i += 2

#         elif token.type == 'paragraph_open':
#             content = ''
#             i += 1
#             while tokens[i].type != 'paragraph_close':
#                 if tokens[i].type == 'inline':
#                     content += tokens[i].content
#                 i += 1
#             blocks.append({"type": "text", "content": content.strip()})

#         elif token.type == 'fence':
#             blocks.append({
#                 "type": "code",
#                 "lang": token.info.strip() if token.info else None,
#                 "content": token.content.strip()
#             })

#         elif token.type in ('bullet_list_open', 'ordered_list_open'):
#             list_buffer = []
#             is_ordered_list = token.type == 'ordered_list_open'

#         elif token.type == 'list_item_open':
#             content = ''
#             i += 1
#             while tokens[i].type != 'list_item_close':
#                 if tokens[i].type == 'inline':
#                     content += tokens[i].content
#                 i += 1
#             list_buffer.append(content.strip())

#         elif token.type in ('bullet_list_close', 'ordered_list_close'):
#             blocks.append({
#                 "type": "list",
#                 "ordered": is_ordered_list,
#                 "items": list_buffer
#             })

#         elif token.type == 'blockquote_open':
#             content = ''
#             i += 1
#             while tokens[i].type != 'blockquote_close':
#                 if tokens[i].type == 'inline':
#                     content += tokens[i].content
#                 i += 1
#             blocks.append({
#                 "type": "blockquote",\
#                 "content": content.strip()
#             })

#         i += 1

#     return blocks
from markdown_it import MarkdownIt
from markdown_it.token import Token
from typing import List, Dict, Union, Any
import json

MarkdownBlock = Dict[str, Any]

def parse_markdown(md: str) -> List[MarkdownBlock]:
    """
    Parse markdown content into structured JSON blocks.
    Handles headings, paragraphs, code blocks, lists, blockquotes, and other elements.
    """
    md_parser = MarkdownIt()
    tokens: List[Token] = md_parser.parse(md)
    blocks: List[MarkdownBlock] = []
    
    i = 0
    while i < len(tokens):
        token = tokens[i]
        
        # Handle headings
        if token.type == 'heading_open':
            level = int(token.tag[1])
            content = ""
            i += 1
            if i < len(tokens) and tokens[i].type == 'inline':
                content = tokens[i].content
                i += 1
            if i < len(tokens) and tokens[i].type == 'heading_close':
                i += 1
            blocks.append({
                "type": "heading",
                "level": level,
                "content": content.strip()
            })
            continue
            
        # Handle paragraphs
        elif token.type == 'paragraph_open':
            content = ""
            i += 1
            while i < len(tokens) and tokens[i].type != 'paragraph_close':
                if tokens[i].type == 'inline':
                    content += tokens[i].content
                i += 1
            if i < len(tokens) and tokens[i].type == 'paragraph_close':
                i += 1
            if content.strip():
                blocks.append({
                    "type": "text",
                    "content": content.strip()
                })
            continue
            
        # Handle code blocks (fenced)
        elif token.type == 'fence':
            blocks.append({
                "type": "code",
                "lang": token.info.strip() if token.info else "",
                "content": token.content.rstrip('\n')
            })
            i += 1
            continue
            
        # Handle code blocks (indented)
        elif token.type == 'code_block':
            blocks.append({
                "type": "code",
                "lang": "",
                "content": token.content.rstrip('\n')
            })
            i += 1
            continue
            
        # Handle lists
        elif token.type in ('bullet_list_open', 'ordered_list_open'):
            is_ordered = token.type == 'ordered_list_open'
            list_items = []
            i += 1
            
            while i < len(tokens) and tokens[i].type not in ('bullet_list_close', 'ordered_list_close'):
                if tokens[i].type == 'list_item_open':
                    item_content = ""
                    i += 1
                    
                    # Collect all content within the list item
                    while i < len(tokens) and tokens[i].type != 'list_item_close':
                        if tokens[i].type == 'inline':
                            item_content += tokens[i].content
                        elif tokens[i].type == 'paragraph_open':
                            i += 1
                            if i < len(tokens) and tokens[i].type == 'inline':
                                item_content += tokens[i].content
                                i += 1
                            if i < len(tokens) and tokens[i].type == 'paragraph_close':
                                i += 1
                            continue
                        i += 1
                    
                    if item_content.strip():
                        list_items.append(item_content.strip())
                    
                    if i < len(tokens) and tokens[i].type == 'list_item_close':
                        i += 1
                else:
                    i += 1
                    
            blocks.append({
                "type": "list",
                "ordered": is_ordered,
                "items": list_items
            })
            
            if i < len(tokens) and tokens[i].type in ('bullet_list_close', 'ordered_list_close'):
                i += 1
            continue
            
        # Handle blockquotes
        elif token.type == 'blockquote_open':
            content = ""
            i += 1
            
            while i < len(tokens) and tokens[i].type != 'blockquote_close':
                if tokens[i].type == 'inline':
                    content += tokens[i].content
                elif tokens[i].type == 'paragraph_open':
                    i += 1
                    if i < len(tokens) and tokens[i].type == 'inline':
                        content += tokens[i].content
                        i += 1
                    if i < len(tokens) and tokens[i].type == 'paragraph_close':
                        i += 1
                    continue
                i += 1
                
            blocks.append({
                "type": "blockquote",
                "content": content.strip()
            })
            
            if i < len(tokens) and tokens[i].type == 'blockquote_close':
                i += 1
            continue
            
        # Handle horizontal rules
        elif token.type == 'hr':
            blocks.append({
                "type": "hr"
            })
            i += 1
            continue
            
        # Handle tables
        elif token.type == 'table_open':
            table_data = []
            headers = []
            i += 1
            
            # Parse table headers
            if i < len(tokens) and tokens[i].type == 'thead_open':
                i += 1
                if i < len(tokens) and tokens[i].type == 'tr_open':
                    i += 1
                    while i < len(tokens) and tokens[i].type != 'tr_close':
                        if tokens[i].type == 'th_open':
                            i += 1
                            if i < len(tokens) and tokens[i].type == 'inline':
                                headers.append(tokens[i].content)
                                i += 1
                            if i < len(tokens) and tokens[i].type == 'th_close':
                                i += 1
                        else:
                            i += 1
                    if i < len(tokens) and tokens[i].type == 'tr_close':
                        i += 1
                if i < len(tokens) and tokens[i].type == 'thead_close':
                    i += 1
            
            # Parse table body
            if i < len(tokens) and tokens[i].type == 'tbody_open':
                i += 1
                while i < len(tokens) and tokens[i].type != 'tbody_close':
                    if tokens[i].type == 'tr_open':
                        row = []
                        i += 1
                        while i < len(tokens) and tokens[i].type != 'tr_close':
                            if tokens[i].type == 'td_open':
                                i += 1
                                if i < len(tokens) and tokens[i].type == 'inline':
                                    row.append(tokens[i].content)
                                    i += 1
                                else:
                                    row.append("")
                                if i < len(tokens) and tokens[i].type == 'td_close':
                                    i += 1
                            else:
                                i += 1
                        table_data.append(row)
                        if i < len(tokens) and tokens[i].type == 'tr_close':
                            i += 1
                    else:
                        i += 1
                if i < len(tokens) and tokens[i].type == 'tbody_close':
                    i += 1
                    
            blocks.append({
                "type": "table",
                "headers": headers,
                "rows": table_data
            })
            
            if i < len(tokens) and tokens[i].type == 'table_close':
                i += 1
            continue
            
        # Handle inline elements or skip unknown tokens
        else:
            i += 1
            continue
    
    return blocks


def markdown_to_json(md: str, indent: int = 2) -> str:
    """
    Convert markdown to JSON string.
    
    Args:
        md: Markdown content as string
        indent: JSON indentation (default: 2)
    
    Returns:
        JSON string representation of parsed markdown
    """
    blocks = parse_markdown(md)
    return json.dumps(blocks, indent=indent, ensure_ascii=False)


# Example usage and test function
def test_parser():
    """Test the parser with various markdown elements"""
    
    test_markdown = """
# Main Title

This is a paragraph with some text.

## Subtitle

Here's another paragraph.

### Code Example

```python
def hello_world():
    print("Hello, World!")
```

### Lists

- Item 1
- Item 2
- Item 3

1. First ordered item
2. Second ordered item
3. Third ordered item

> This is a blockquote
> with multiple lines

---

| Column 1 | Column 2 | Column 3 |
|----------|----------|----------|
| Data 1   | Data 2   | Data 3   |
| Data 4   | Data 5   | Data 6   |

Some final text.
"""
    
    # Parse to blocks
    blocks = parse_markdown(test_markdown)
    
    # Convert to JSON
    json_output = markdown_to_json(test_markdown)
    
    print("Parsed blocks:")
    for block in blocks:
        print(f"- {block['type']}: {block.get('content', block.get('items', block.get('headers', 'N/A')))[:50]}...")
    
    print("\nJSON Output:")
    print(json_output)
    
    return blocks, json_output

if __name__ == "__main__":
    test_parser()