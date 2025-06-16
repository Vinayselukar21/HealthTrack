import axios from "axios";
import { useQuery } from "@tanstack/react-query"
import { useAuth } from "@/components/auth-provider";


export interface MedicalReport {
    _id: string;
    report_name: string;
    patient_details: {
      patient_name: string;
      patient_id: string;
    };
    tests: TestParameter[];
    auth_userid: string;
    db_userid: string;
    report_metadata: {
      report_name: string;
      report_id: string;
      report_date: string;
      doctor_name: string;
      hospital_name: string;
      department: string;
      laboratory_name: string;
      equipment_used: string[];
    };
  }
  
  export interface TestParameter {
    parameter_name: string;
    parameter_tag: string;
    value: string;
    unit: string;
    reference_range: {
      lower_limit: number;
      upper_limit: number;
      range_text: string;
    };
    status: string;
    full_form: string;
    method: string;
    notes: string;
    clinical_significance: string;
  }
  
  export interface ParameterValue {
    value: string;
    report_date: string;
  }
  
  export interface ParameterValuesMap {
    [parameterTag: string]: ParameterValue[];
  }
  

interface QueryResponse{
    message: string;
    data: MedicalReport
    parameter_values: ParameterValuesMap;
}

const useGetReportById = (reportId: string) => {
    const {user} = useAuth()
    const fetch= async()=> {
        const response = await axios.get(`http://localhost:8000/report-detail/${reportId}?auth_userid=${user?.id}`, {
            headers: {
                'Content-Type': 'application/json',
            },
        });
        return response.data;
    }

    const { data, isLoading: reportLoading } = useQuery<QueryResponse>({
        queryFn: fetch,
        queryKey: ["report", reportId, user?.id],
        enabled: !!reportId && !!user?.id
    })

    const reportData: MedicalReport | undefined = data?.data
    const reportParameterHistoryData: ParameterValuesMap | undefined = data?.parameter_values

    return {
        reportData, reportParameterHistoryData, reportLoading
    }
}
export default useGetReportById;