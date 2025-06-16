import axios from "axios";
import { useQuery } from "@tanstack/react-query"
const useGetAllReports = (auth_userid: string) => {
    async function fetch() {
        const response = await axios.get(`http://localhost:8000/reports/${auth_userid}`, {
            headers: {
                'Content-Type': 'application/json',
            },
        });
        return response.data;
    }

    const { data: reportsData, isLoading: reportsLoading } = useQuery({
        queryFn: fetch,
        queryKey: ["user-reports"],
        enabled: !!auth_userid
    })
    return {
        reportsData, reportsLoading
    }
}
export default useGetAllReports;