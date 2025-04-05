"use client";

import { useEffect, useReducer, useState } from "react";
import { useRouter } from "next/navigation";
import { 
  getVisitor, 
  getVisitorVisits, 
  getVisitorBans, 
  getVisitorIncidents, 
  Visitor, 
  Visit, 
  Ban, 
  Incident 
} from "@/app/actions/admin";

interface State {
  visitor: Visitor | null;
  visits: Visit[];
  bans: Ban[];
  incidents: Incident[];
  loading: boolean;
  error: string;
}

const initialState: State = {
  visitor: null,
  visits: [],
  bans: [],
  incidents: [],
  loading: true,
  error: "",
};

type Action =
  | { type: "SET_VISITOR"; payload: Visitor }
  | { type: "SET_VISITS"; payload: Visit[] }
  | { type: "SET_BANS"; payload: Ban[] }
  | { type: "SET_INCIDENTS"; payload: Incident[] }
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "SET_ERROR"; payload: string };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "SET_VISITOR":
      return { ...state, visitor: action.payload };
    case "SET_VISITS":
      return { ...state, visits: action.payload };
    case "SET_BANS":
      return { ...state, bans: action.payload };
    case "SET_INCIDENTS":
      return { ...state, incidents: action.payload };
    case "SET_LOADING":
      return { ...state, loading: action.payload };
    case "SET_ERROR":
      return { ...state, error: action.payload };
    default:
      return state;
  }
}

export default function VisitorDetailsPage({ params }: { params: { id: string } }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const [activeTab, setActiveTab] = useState<"visits" | "incidents" | "bans">("visits");
  const router = useRouter();
  const visitorId = params.id;

  useEffect(() => {
    async function fetchVisitorDetails() {
      try {
        dispatch({ type: "SET_LOADING", payload: true });

        const visitorData = await getVisitor(visitorId);
        dispatch({ type: "SET_VISITOR", payload: visitorData });

        const visitsData = await getVisitorVisits(visitorId);
        dispatch({ type: "SET_VISITS", payload: visitsData.items });

        const bansData = await getVisitorBans(visitorId);
        dispatch({ type: "SET_BANS", payload: bansData.items });

        const incidentsData = await getVisitorIncidents(visitorId);
        dispatch({ type: "SET_INCIDENTS", payload: incidentsData.items });
      } catch (err) {
        console.error("Failed to fetch visitor details:", err);
        dispatch({ type: "SET_ERROR", payload: "Failed to load visitor details. Please try again later." });
      } finally {
        dispatch({ type: "SET_LOADING", payload: false });
      }
    }

    fetchVisitorDetails();
  }, [visitorId]);

  if (state.loading) {
    return <div className="p-6 text-center">Loading visitor details...</div>;
  }

  if (state.error) {
    return <div className="p-6 text-center text-red-500">{state.error}</div>;
  }

  if (!state.visitor) {
    return <div className="p-6 text-center">Visitor not found</div>;
  }

  return (
    <div className="ml-64 p-8 bg-gray-500 h-175">
      {/* Back Button */}
      <button onClick={() => router.back()} className="mb-4 flex items-center text-gray-100">
        <svg xmlns="http://www.w3.org/2000/svg" className="mr-1 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back to Visitors
      </button>

      {/* Visitor Details */}
      <h1 className="mb-6 text-3xl font-bold">
        Visitor Details: {state.visitor.first_name} {state.visitor.last_name}
      </h1>

      {/* Tabs */}
      <div className="mb-6 border-b border-gray-700">
        {["visits", "incidents", "bans"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab as "visits" | "incidents" | "bans")}
            className={`px-4 py-3 text-sm font-medium ${
              activeTab === tab ? "border-b-2 border-blue-500 text-blue-500" : "text-gray-400 hover:text-gray-200"
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)} ({state[tab].length})
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="rounded-lg bg-gray-800 p-6 shadow-md">
        {activeTab === "visits" && <VisitTable visits={state.visits} />}
        {activeTab === "incidents" && <IncidentTable incidents={state.incidents} />}
        {activeTab === "bans" && <BanTable bans={state.bans} />}
      </div>
    </div>
  );
}

/* Table Components */
const VisitTable = ({ visits }: { visits: Visit[] }) => (
  visits.length === 0 ? <p>No visits recorded.</p> : 
  <Table columns={["Date", "Reason", "Status", "Duration", "Approved By"]} data={visits.map(v => [
    new Date(v.visit_time).toLocaleDateString(), v.reason, v.status, v.duration || "N/A", v.approved_by_id
  ])}/>
);

const IncidentTable = ({ incidents }: { incidents: Incident[] }) => (
  incidents.length === 0 ? <p>No incidents recorded.</p> : 
  <Table columns={["Date", "Description", "Recorded By"]} data={incidents.map(i => [
    new Date(i.recorded_at).toLocaleDateString(), i.description, i.recorded_by_id
  ])}/>
);

const BanTable = ({ bans }: { bans: Ban[] }) => (
  bans.length === 0 ? <p>No bans recorded.</p> : 
  <Table columns={["Date Issued", "Reason", "Status", "Date Lifted", "Issued By"]} data={bans.map(b => [
    new Date(b.issued_at).toLocaleDateString(), b.reason, b.is_active ? "Active" : "Lifted", 
    b.lifted_at ? new Date(b.lifted_at).toLocaleDateString() : "N/A", b.issued_by_id
  ])}/>
);

const Table = ({ columns, data }: { columns: string[], data: string[][] }) => (
  <div className="overflow-x-auto">
    <table className="w-full border-collapse">
      <thead>
        <tr className="border-b border-gray-700">{columns.map(col => <th key={col} className="px-4 py-2 text-left">{col}</th>)}</tr>
      </thead>
      <tbody>
        {data.map((row, i) => <tr key={i} className="border-b border-gray-700">{row.map((cell, j) => <td key={j} className="px-4 py-2">{cell}</td>)}</tr>)}
      </tbody>
    </table>
  </div>
);
