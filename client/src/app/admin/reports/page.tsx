"use client";

import { useState, useEffect } from 'react';
import { getAllVisits, getAllBans, getAllIncidents, getDashboardSummary } from '@/app/actions/admin';
import { Visit, Ban, Incident, DashboardSummary } from '@/app/actions/admin';
import { PDFDownloadLink, Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer';
import { format, parseISO, subDays, differenceInDays } from 'date-fns';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

// Register fonts for PDF rendering
Font.register({
  family: 'Helvetica',
  fonts: [
    { src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-regular-webfont.ttf' },
    { src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-bold-webfont.ttf', fontWeight: 'bold' },
    { src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-italic-webfont.ttf', fontStyle: 'italic' },
  ],
});

// PDF styling
const styles = StyleSheet.create({
  page: { 
    padding: 30, 
    fontFamily: 'Helvetica',
    backgroundColor: '#FFFFFF',
  },
  header: { 
    fontSize: 24, 
    marginBottom: 20, 
    fontWeight: 'bold',
    color: '#333333',
    textAlign: 'center',
    paddingBottom: 10,
    borderBottom: '1 solid #CCCCCC',
  },
  subheader: {
    fontSize: 16,
    marginBottom: 15,
    color: '#555555',
    textAlign: 'center',
  },
  metaInfo: {
    fontSize: 10,
    marginBottom: 20,
    color: '#777777',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  table: { 
    display: "flex", 
    width: "auto", 
    border: "1 solid #e0e0e0",
    marginTop: 10,
  },
  tableHeader: {
    flexDirection: "row", 
    borderBottomWidth: 1,
    borderBottomColor: '#CCCCCC',
    borderBottomStyle: 'solid',
    backgroundColor: '#F0F0F0',
  },
  tableRow: { 
    flexDirection: "row", 
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
    borderBottomStyle: 'solid',
    minHeight: 30,
  },
  tableCell: { 
    padding: 8, 
    fontSize: 10,
    textAlign: 'left',
    alignSelf: 'center',
  },
  headerCell: { 
    padding: 8, 
    fontSize: 10, 
    fontWeight: 'bold',
    color: '#333333',
    textAlign: 'left',
  },
  summarySection: {
    marginVertical: 15, 
    padding: 10,
    backgroundColor: '#F9F9F9',
    borderRadius: 5,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333333',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 5,
    borderBottom: '1 solid #EEEEEE',
  },
  summaryKey: {
    fontSize: 10,
    color: '#555555',
    width: '50%',
  },
  summaryValue: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#333333',
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 30,
    right: 30,
    fontSize: 10,
    color: '#999999',
    textAlign: 'center',
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
    borderTopStyle: 'solid',
    paddingTop: 10,
  },
  visitsApproved: { color: '#22C55E' },
  visitsPending: { color: '#EAB308' },
  bansActive: { color: '#EF4444' },
  bansLifted: { color: '#6B7280' },
  pageNumber: {
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
    fontSize: 10,
    textAlign: 'center',
    color: '#999999',
  },
  statsContainer: {
    marginVertical: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statBox: {
    padding: 10,
    backgroundColor: '#F9F9F9',
    borderRadius: 5,
    width: '30%',
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  statLabel: {
    fontSize: 10,
    color: '#666666',
  },
  filtersSummary: {
    fontSize: 12,
    marginBottom: 15,
    color: '#666666',
    fontStyle: 'italic',
  }
});

// PDF Document component for Visits
const VisitsReportDocument = ({ 
  data, 
  title, 
  dateRange, 
  filterSummary,
  stats 
}: { 
  data: Visit[], 
  title: string,
  dateRange: string,
  filterSummary: string,
  stats: {
    total: number,
    approved: number,
    pending: number
  }
}) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <Text style={styles.header}>{title}</Text>
      <Text style={styles.subheader}>{dateRange}</Text>
      <Text style={styles.filtersSummary}>{filterSummary}</Text>
      
      <View style={styles.statsContainer}>
        <View style={styles.statBox}>
          <Text style={styles.statNumber}>{stats.total}</Text>
          <Text style={styles.statLabel}>Total Visits</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={[styles.statNumber, styles.visitsApproved]}>{stats.approved}</Text>
          <Text style={styles.statLabel}>Approved</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={[styles.statNumber, styles.visitsPending]}>{stats.pending}</Text>
          <Text style={styles.statLabel}>Pending</Text>
        </View>
      </View>
      
      <View style={styles.table}>
        <View style={styles.tableHeader}>
          <Text style={[styles.headerCell, { width: '20%' }]}>Visitor</Text>
          <Text style={[styles.headerCell, { width: '25%' }]}>Reason</Text>
          <Text style={[styles.headerCell, { width: '20%' }]}>Visit Time</Text>
          <Text style={[styles.headerCell, { width: '20%' }]}>Leave Time</Text>
          <Text style={[styles.headerCell, { width: '15%' }]}>Status</Text>
        </View>
        
        {data.map((item, index) => (
          <View key={index} style={[styles.tableRow, { backgroundColor: index % 2 === 0 ? '#FFFFFF' : '#FAFAFA' }]}>
            <Text style={[styles.tableCell, { width: '20%' }]}>
              {item.visitor.first_name} {item.visitor.last_name}
            </Text>
            <Text style={[styles.tableCell, { width: '25%' }]}>{item.reason}</Text>
            <Text style={[styles.tableCell, { width: '20%' }]}>
              {format(parseISO(item.visit_time), 'MMM dd, yyyy HH:mm')}
            </Text>
            <Text style={[styles.tableCell, { width: '20%' }]}>
              {item.leave_time ? format(parseISO(item.leave_time), 'MMM dd, yyyy HH:mm') : 'Not left'}
            </Text>
            <Text style={[
              styles.tableCell, 
              { width: '15%' },
              item.status === 'approved' ? styles.visitsApproved : styles.visitsPending
            ]}>
              {item.status}
            </Text>
          </View>
        ))}
      </View>
      
      <View style={styles.footer}>
        <Text>Generated on {format(new Date(), 'MMMM dd, yyyy HH:mm:ss')}</Text>
        <Text>Security Management System - Confidential</Text>
      </View>
      
      <Text
        style={styles.pageNumber}
        render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`}
        fixed
      />
    </Page>
  </Document>
);

// PDF Document component for Bans
const BansReportDocument = ({ 
  data, 
  title, 
  dateRange,
  filterSummary,
  stats 
}: { 
  data: Ban[], 
  title: string,
  dateRange: string,
  filterSummary: string,
  stats: {
    total: number,
    active: number,
    lifted: number
  }
}) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <Text style={styles.header}>{title}</Text>
      <Text style={styles.subheader}>{dateRange}</Text>
      <Text style={styles.filtersSummary}>{filterSummary}</Text>
      
      <View style={styles.statsContainer}>
        <View style={styles.statBox}>
          <Text style={styles.statNumber}>{stats.total}</Text>
          <Text style={styles.statLabel}>Total Bans</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={[styles.statNumber, styles.bansActive]}>{stats.active}</Text>
          <Text style={styles.statLabel}>Active</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={[styles.statNumber, styles.bansLifted]}>{stats.lifted}</Text>
          <Text style={styles.statLabel}>Lifted</Text>
        </View>
      </View>
      
      <View style={styles.table}>
        <View style={styles.tableHeader}>
          <Text style={[styles.headerCell, { width: '20%' }]}>Visitor</Text>
          <Text style={[styles.headerCell, { width: '30%' }]}>Reason</Text>
          <Text style={[styles.headerCell, { width: '20%' }]}>Issued At</Text>
          <Text style={[styles.headerCell, { width: '15%' }]}>Lifted At</Text>
          <Text style={[styles.headerCell, { width: '15%' }]}>Status</Text>
        </View>
        
        {data.map((item, index) => (
          <View key={index} style={[styles.tableRow, { backgroundColor: index % 2 === 0 ? '#FFFFFF' : '#FAFAFA' }]}>
            <Text style={[styles.tableCell, { width: '20%' }]}>
              {item.visitor.first_name} {item.visitor.last_name}
            </Text>
            <Text style={[styles.tableCell, { width: '30%' }]}>{item.reason}</Text>
            <Text style={[styles.tableCell, { width: '20%' }]}>
              {format(parseISO(item.issued_at), 'MMM dd, yyyy HH:mm')}
            </Text>
            <Text style={[styles.tableCell, { width: '15%' }]}>
              {item.lifted_at ? format(parseISO(item.lifted_at), 'MMM dd, yyyy HH:mm') : 'N/A'}
            </Text>
            <Text style={[
              styles.tableCell, 
              { width: '15%' },
              item.is_active ? styles.bansActive : styles.bansLifted
            ]}>
              {item.is_active ? 'Active' : 'Lifted'}
            </Text>
          </View>
        ))}
      </View>
      
      <View style={styles.footer}>
        <Text>Generated on {format(new Date(), 'MMMM dd, yyyy HH:mm:ss')}</Text>
        <Text>Security Management System - Confidential</Text>
      </View>
      
      <Text
        style={styles.pageNumber}
        render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`}
        fixed
      />
    </Page>
  </Document>
);

// PDF Document component for Incidents
const IncidentsReportDocument = ({ 
  data, 
  title, 
  dateRange,
  filterSummary 
}: { 
  data: Incident[], 
  title: string,
  dateRange: string,
  filterSummary: string
}) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <Text style={styles.header}>{title}</Text>
      <Text style={styles.subheader}>{dateRange}</Text>
      <Text style={styles.filtersSummary}>{filterSummary}</Text>
      
      <View style={styles.statsContainer}>
        <View style={styles.statBox}>
          <Text style={styles.statNumber}>{data.length}</Text>
          <Text style={styles.statLabel}>Total Incidents</Text>
        </View>
      </View>
      
      <View style={styles.table}>
        <View style={styles.tableHeader}>
          <Text style={[styles.headerCell, { width: '20%' }]}>Visitor</Text>
          <Text style={[styles.headerCell, { width: '40%' }]}>Description</Text>
          <Text style={[styles.headerCell, { width: '20%' }]}>Recorded At</Text>
          <Text style={[styles.headerCell, { width: '20%' }]}>Recorded By</Text>
        </View>
        
        {data.map((item, index) => (
          <View key={index} style={[styles.tableRow, { backgroundColor: index % 2 === 0 ? '#FFFFFF' : '#FAFAFA' }]}>
            <Text style={[styles.tableCell, { width: '20%' }]}>
              {item.visitor.first_name} {item.visitor.last_name}
            </Text>
            <Text style={[styles.tableCell, { width: '40%' }]}>{item.description}</Text>
            <Text style={[styles.tableCell, { width: '20%' }]}>
              {format(parseISO(item.recorded_at), 'MMM dd, yyyy HH:mm')}
            </Text>
            <Text style={[styles.tableCell, { width: '20%' }]}>
              {item.recorded_by.first_name} {item.recorded_by.last_name}
            </Text>
          </View>
        ))}
      </View>
      
      <View style={styles.footer}>
        <Text>Generated on {format(new Date(), 'MMMM dd, yyyy HH:mm:ss')}</Text>
        <Text>Security Management System - Confidential</Text>
      </View>
      
      <Text
        style={styles.pageNumber}
        render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`}
        fixed
      />
    </Page>
  </Document>
);

// PDF Document component for Summary
const SummaryReportDocument = ({ 
  data, 
  title, 
  dateRange 
}: { 
  data: DashboardSummary, 
  title: string,
  dateRange: string
}) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <Text style={styles.header}>{title}</Text>
      <Text style={styles.subheader}>{dateRange}</Text>
      
      <View style={styles.summarySection}>
        <Text style={styles.summaryTitle}>System Overview</Text>
        
        <View style={styles.summaryRow}>
          <Text style={styles.summaryKey}>Total Visitors:</Text>
          <Text style={styles.summaryValue}>{data.total_visitors}</Text>
        </View>
        
        <View style={styles.summaryRow}>
          <Text style={styles.summaryKey}>Active Visits:</Text>
          <Text style={styles.summaryValue}>{data.active_visits}</Text>
        </View>
        
        <View style={styles.summaryRow}>
          <Text style={styles.summaryKey}>Visits Today:</Text>
          <Text style={styles.summaryValue}>{data.visits_today}</Text>
        </View>
        
        <View style={styles.summaryRow}>
          <Text style={styles.summaryKey}>Active Bans:</Text>
          <Text style={styles.summaryValue}>{data.active_bans}</Text>
        </View>
        
        <View style={styles.summaryRow}>
          <Text style={styles.summaryKey}>Total Security Personnel:</Text>
          <Text style={styles.summaryValue}>{data.security_personnel_count}</Text>
        </View>
      </View>
      
      <View style={styles.summarySection}>
        <Text style={styles.summaryTitle}>Activity Statistics</Text>
        
        <View style={styles.summaryRow}>
          <Text style={styles.summaryKey}>Total Visits:</Text>
          <Text style={styles.summaryValue}>{data.total_visits}</Text>
        </View>
        
        <View style={styles.summaryRow}>
          <Text style={styles.summaryKey}>Total Incidents:</Text>
          <Text style={styles.summaryValue}>{data.total_incidents}</Text>
        </View>
        
        <View style={styles.summaryRow}>
          <Text style={styles.summaryKey}>Total Bans:</Text>
          <Text style={styles.summaryValue}>{data.total_bans}</Text>
        </View>
        
        <View style={styles.summaryRow}>
          <Text style={styles.summaryKey}>Incidents Today:</Text>
          <Text style={styles.summaryValue}>{data.incidents_today}</Text>
        </View>
      </View>
      
      <View style={styles.summarySection}>
        <Text style={styles.summaryTitle}>Top Frequent Visitors</Text>
        
        {data.frequent_visitors && data.frequent_visitors.map((visitor, index) => (
          <View key={index} style={styles.summaryRow}>
            <Text style={styles.summaryKey}>{visitor.full_name}</Text>
            <Text style={styles.summaryValue}>{visitor.visit_count} visits</Text>
          </View>
        ))}
      </View>
      
      <View style={styles.footer}>
        <Text>Generated on {format(new Date(), 'MMMM dd, yyyy HH:mm:ss')}</Text>
        <Text>Security Management System - Confidential</Text>
      </View>
      
      <Text
        style={styles.pageNumber}
        render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`}
        fixed
      />
    </Page>
  </Document>
);

// Helper functions
const formatDate = (dateString: string) => 
  format(parseISO(dateString), 'MMM dd, yyyy HH:mm');

const getDateRangeString = (startDate: Date, endDate: Date) => {
  return `${format(startDate, 'MMMM dd, yyyy')} to ${format(endDate, 'MMMM dd, yyyy')}`;
};

// Main component
export default function ReportsPage() {
  // State for report options
  const [reportType, setReportType] = useState<'visits' | 'bans' | 'incidents' | 'summary'>('visits');
  const [startDate, setStartDate] = useState<Date>(subDays(new Date(), 30));
  const [endDate, setEndDate] = useState<Date>(new Date());
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('date_desc');
  
  // State for report data
  const [visitsData, setVisitsData] = useState<Visit[]>([]);
  const [bansData, setBansData] = useState<Ban[]>([]);
  const [incidentsData, setIncidentsData] = useState<Incident[]>([]);
  const [summaryData, setSummaryData] = useState<DashboardSummary | null>(null);
  
  // UI state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [perPage, setPerPage] = useState<number>(25);
  const [dataGenerated, setDataGenerated] = useState(false);

  // Computed properties for statistics
  const visitsStats = {
    total: visitsData.length,
    approved: visitsData.filter(v => v.status === 'approved').length,
    pending: visitsData.filter(v => v.status !== 'approved').length
  };

  const bansStats = {
    total: bansData.length,
    active: bansData.filter(b => b.is_active).length,
    lifted: bansData.filter(b => !b.is_active).length
  };

  // Generate filter summary for PDF report
  const getFilterSummary = () => {
    let summary = '';
    
    if (reportType === 'visits' && statusFilter !== 'all') {
      summary += `Status: ${statusFilter.charAt(0).toUpperCase() + statusFilter.slice(1)} | `;
    }
    
    if (reportType === 'bans' && statusFilter !== 'all') {
      summary += `Status: ${statusFilter === 'active' ? 'Active' : 'Lifted'} | `;
    }
    
    if (differenceInDays(endDate, startDate) >= 0) {
      summary += `Date Range: ${differenceInDays(endDate, startDate) + 1} days`;
    }
    
    return summary || 'No filters applied';
  };

  // Fetch data based on report type and filters
  const fetchData = async () => {
    try {
      setLoading(true);
      setError('');
      setDataGenerated(false);
      
      const params = {
        page: 1,
        perPage,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString()
      };

      switch(reportType) {
        case 'visits': {
          const visits = await getAllVisits(1, 1000);
          let filteredVisits = visits.items;
          
          // Apply status filter
          if (statusFilter !== 'all') {
            filteredVisits = filteredVisits.filter(visit => visit.status === statusFilter);
          }
          
          // Apply date filter
          filteredVisits = filteredVisits.filter(visit => {
            const visitDate = new Date(visit.visit_time);
            return visitDate >= startDate && visitDate <= endDate;
          });
          
          // Apply sorting
          if (sortBy === 'date_asc') {
            filteredVisits.sort((a, b) => new Date(a.visit_time).getTime() - new Date(b.visit_time).getTime());
          } else if (sortBy === 'date_desc') {
            filteredVisits.sort((a, b) => new Date(b.visit_time).getTime() - new Date(a.visit_time).getTime());
          }
          
          setVisitsData(filteredVisits);
          break;
        }
        case 'bans': {
          const bans = await getAllBans(1, 1000);
          let filteredBans = bans.items;
          
          // Apply status filter
          if (statusFilter === 'active') {
            filteredBans = filteredBans.filter(ban => ban.is_active);
          } else if (statusFilter === 'lifted') {
            filteredBans = filteredBans.filter(ban => !ban.is_active);
          }
          
          // Apply date filter
          filteredBans = filteredBans.filter(ban => {
            const banDate = new Date(ban.issued_at);
            return banDate >= startDate && banDate <= endDate;
          });
          
          // Apply sorting
          if (sortBy === 'date_asc') {
            filteredBans.sort((a, b) => new Date(a.issued_at).getTime() - new Date(b.issued_at).getTime());
          } else if (sortBy === 'date_desc') {
            filteredBans.sort((a, b) => new Date(b.issued_at).getTime() - new Date(a.issued_at).getTime());
          }
          
          setBansData(filteredBans);
          break;
        }
        case 'incidents': {
          const incidents = await getAllIncidents(1, 1000);
          let filteredIncidents = incidents.items;
          
          // Apply date filter
          filteredIncidents = filteredIncidents.filter(incident => {
            const incidentDate = new Date(incident.recorded_at);
            return incidentDate >= startDate && incidentDate <= endDate;
          });
          
          // Apply sorting
          if (sortBy === 'date_asc') {
            filteredIncidents.sort((a, b) => new Date(a.recorded_at).getTime() - new Date(b.recorded_at).getTime());
          } else if (sortBy === 'date_desc') {
            filteredIncidents.sort((a, b) => new Date(b.recorded_at).getTime() - new Date(a.recorded_at).getTime());
          }
          
          setIncidentsData(filteredIncidents);
          break;
        }
        case 'summary':
          const summary = await getDashboardSummary();
          setSummaryData(summary);
          break;
      }
      
      setDataGenerated(true);
    } catch (err) {
      console.error("Error fetching data:", err);
      setError('Failed to fetch report data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Report title generation
  const getReportTitle = () => {
    const typeMap = {
      visits: 'Visits Report',
      bans: 'Bans Report',
      incidents: 'Incidents Report',
      summary: 'System Summary Report'
    };
    return typeMap[reportType];
  };

  // Reset filters
  const handleResetFilters = () => {
    setStartDate(subDays(new Date(), 30));
    setEndDate(new Date());
    setStatusFilter('all');
    setSortBy('date_desc');
  };

  // Predefined date range options
  const setDateRange = (range: string) => {
    const today = new Date();
    
    switch (range) {
      case 'today':
        setStartDate(today);
        setEndDate(today);
        break;
      case 'yesterday':
        const yesterday = subDays(today, 1);
        setStartDate(yesterday);
        setEndDate(yesterday);
        break;
      case 'week':
        setStartDate(subDays(today, 7));
        setEndDate(today);
        break;
      case 'month':
        setStartDate(subDays(today, 30));
        setEndDate(today);
        break;
      case 'quarter':
        setStartDate(subDays(today, 90));
        setEndDate(today);
        break;
    }
  };

  return (
    <div className="ml-64 p-8 bg-gray-500 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="bg-gray-900 shadow-lg rounded-lg overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-blue-800 p-6">
            <h1 className="text-3xl font-bold text-white">Advanced Report Generation</h1>
            <p className="text-blue-100 mt-2">Generate detailed reports with comprehensive filtering options</p>
          </div>
          
          {/* Filters Section */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex flex-wrap justify-between items-end gap-4 mb-6">
              <div className="flex flex-wrap gap-4 items-end">
                <div className="w-48">
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Report Type
                  </label>
                  <select 
                    className="w-full border border-gray-300 rounded-md shadow-sm p-2 bg-white text-gray-900  focus:ring-blue-500 focus:border-blue-500"
                    value={reportType}
                    onChange={(e) => setReportType(e.target.value as any)}
                  >
                    <option value="visits">Visits</option>
                    <option value="bans">Bans</option>
                    <option value="incidents">Incidents</option>
                    <option value="summary">System Summary</option>
                  </select>
                </div>
                
                <div className="w-48">
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Sort By
                  </label>
                  <select 
                    className="w-full border border-gray-300 rounded-md shadow-sm p-2
                    bg-white text-gray-900 focus:ring-blue-500 focus:border-blue-500"
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                  >
                    <option value="date_desc">Newest First</option>
                    <option value="date_asc">Oldest First</option>
                  </select>
                </div>
                
                <div className="flex flex-col gap-2">
                  <label className="block text-sm font-medium text-gray-300">
                    Date Range
                  </label>
                  <div className="flex gap-2">
                    <DatePicker
                      selected={startDate}
                      onChange={date => date && setStartDate(date)}
                      selectsStart
                      startDate={startDate}
                      endDate={endDate}
                      className="w-36 border rounded-md p-2 bg-white text-gray-900"
                    />
                    <span className="self-center">–</span>
                    <DatePicker
                      selected={endDate}
                      onChange={date => date && setEndDate(date)}
                      selectsEnd
                      startDate={startDate}
                      endDate={endDate}
                      minDate={startDate}
                      className="w-36 border rounded-md p-2 bg-white text-gray-900"
                    />
                  </div>
                </div>
              </div>
              
              <div className="flex gap-2">
                <button
                  onClick={handleResetFilters}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
                >
                  Reset Filters
                </button>
                <button
                  onClick={fetchData}
                  disabled={loading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400"
                >
                  {loading ? 'Generating...' : 'Generate Report'}
                </button>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setDateRange('today')}
                className="px-3 py-1 text-sm bg-blue-600 rounded-md hover:bg-blue-700"
              >
                Today
              </button>
              <button
                onClick={() => setDateRange('yesterday')}
                className="px-3 py-1 text-sm bg-blue-600 rounded-md hover:bg-blue-700"
              >
                Yesterday
              </button>
              <button
                onClick={() => setDateRange('week')}
                className="px-3 py-1 text-sm bg-blue-600 rounded-md hover:bg-blue-700"
              >
                Last Week
              </button>
              <button
                onClick={() => setDateRange('month')}
                className="px-3 py-1 text-sm bg-blue-600 rounded-md hover:bg-blue-700"
              >
                Last Month
              </button>
              <button
                onClick={() => setDateRange('quarter')}
                className="px-3 py-1 text-sm bg-blue-600 rounded-md hover:bg-blue-700"
              >
                Last Quarter
              </button>
            </div>
          </div>

          {/* Report Display Section */}
          <div className="p-6">
            {error && (
              <div className="mb-4 p-4 bg-red-50 text-red-700 rounded-md">
                {error}
              </div>
            )}

            {dataGenerated && (
              <div className="mb-6 flex justify-between items-center">
                <h2 className="text-xl font-semibold">
                  {getReportTitle()} - {format(startDate, 'MMM dd')} to {format(endDate, 'MMM dd')}
                </h2>
                {dataGenerated && reportType !== 'summary' && (
                  <PDFDownloadLink
                  key={`${reportType}-${dataGenerated}`}
                    document={
                      reportType === 'visits' ? (
                        <VisitsReportDocument
                          data={visitsData}
                          title={getReportTitle()}
                          dateRange={getDateRangeString(startDate, endDate)}
                          filterSummary={getFilterSummary()}
                          stats={visitsStats}
                        />
                      ) : reportType === 'bans' ? (
                        <BansReportDocument
                          data={bansData}
                          title={getReportTitle()}
                          dateRange={getDateRangeString(startDate, endDate)}
                          filterSummary={getFilterSummary()}
                          stats={bansStats}
                        />
                      ) : reportType === 'incidents' ? (
                        <IncidentsReportDocument
                          data={incidentsData}
                          title={getReportTitle()}
                          dateRange={getDateRangeString(startDate, endDate)}
                          filterSummary={getFilterSummary()}
                        />
                      ) : (
                        <SummaryReportDocument
                          data={summaryData!}
                          title={getReportTitle()}
                          dateRange={getDateRangeString(startDate, endDate)}
                        />
                      )
                    }
                    fileName={`${getReportTitle()} - ${format(new Date(), 'yyyy-MM-dd')}.pdf`}
                  >
                    {({ loading: pdfLoading }) => (
                      <button
                        className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400"
                        disabled={pdfLoading}
                      >
                        {pdfLoading ? 'Preparing PDF...' : 'Download PDF'}
                      </button>
                    )}
                  </PDFDownloadLink>
                )}
              </div>
            )}

            {reportType !== 'summary' ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-blue-600">
                    <tr>
                      {reportType === 'visits' && (
                        <>
                          <th className="p-3 text-left">Visitor</th>
                          <th className="p-3 text-left">Reason</th>
                          <th className="p-3 text-left">Visit Time</th>
                          <th className="p-3 text-left">Status</th>
                        </>
                      )}
                      {reportType === 'bans' && (
                        <>
                          <th className="p-3 text-left">Visitor</th>
                          <th className="p-3 text-left">Reason</th>
                          <th className="p-3 text-left">Issued At</th>
                          <th className="p-3 text-left">Status</th>
                        </>
                      )}
                      {reportType === 'incidents' && (
                        <>
                          <th className="p-3 text-left">Visitor</th>
                          <th className="p-3 text-left">Description</th>
                          <th className="p-3 text-left">Recorded At</th>
                          <th className="p-3 text-left">Recorded By</th>
                        </>
                      )}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {(reportType === 'visits' ? visitsData : 
                      reportType === 'bans' ? bansData : 
                      incidentsData).map((item, index) => (
                      <tr key={index} className="hover:bg-gray-600">
                        {reportType === 'visits' && (
                          <>
                            <td className="p-3">{(item as Visit).visitor.first_name} {(item as Visit).visitor.last_name}</td>
                            <td className="p-3">{(item as Visit).reason}</td>
                            <td className="p-3">{formatDate((item as Visit).visit_time)}</td>
                            <td className="p-3">
                              <span className={`px-2 py-1 rounded-full text-xs ${
                                (item as Visit).status === 'approved' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                              }`}>
                                {(item as Visit).status}
                              </span>
                            </td>
                          </>
                        )}
                        {reportType === 'bans' && (
                          <>
                            <td className="p-3">{(item as Ban).visitor.first_name} {(item as Ban).visitor.last_name}</td>
                            <td className="p-3">{(item as Ban).reason}</td>
                            <td className="p-3">{formatDate((item as Ban).issued_at)}</td>
                            <td className="p-3">
                              <span className={`px-2 py-1 rounded-full text-xs ${
                                (item as Ban).is_active ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'
                              }`}>
                                {(item as Ban).is_active ? 'Active' : 'Lifted'}
                              </span>
                            </td>
                          </>
                        )}
                        {reportType === 'incidents' && (
                          <>
                            <td className="p-3">{(item as Incident).visitor.first_name} {(item as Incident).visitor.last_name}</td>
                            <td className="p-3">{(item as Incident).description}</td>
                            <td className="p-3">{formatDate((item as Incident).recorded_at)}</td>
                            <td className="p-3">{(item as Incident).recorded_by.first_name} {(item as Incident).recorded_by.last_name}</td>
                          </>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
                
                {(reportType === 'visits' && visitsData.length === 0) ||
                (reportType === 'bans' && bansData.length === 0) ||
                (reportType === 'incidents' && incidentsData.length === 0) ? (
                  <div className="p-6 text-center text-gray-500">
                    No records found for the selected filters
                  </div>
                ) : null}
              </div>
            ) : summaryData && (
              <div className="grid grid-cols-2 gap-6">
                <div className="bg-gray-700 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold mb-4">System Overview</h3>
                  <dl className="space-y-3">
                    <div className="flex justify-between">
                      <dt className="text-gray-200">Total Visitors</dt>
                      <dd className="font-medium">{summaryData.total_visitors}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-gray-200">Active Visits</dt>
                      <dd className="font-medium">{summaryData.active_visits}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-gray-200">Visits Today</dt>
                      <dd className="font-medium">{summaryData.visits_today}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-gray-200">Active Bans</dt>
                      <dd className="font-medium">{summaryData.active_bans}</dd>
                    </div>
                  </dl>
                </div>
                
                <div className="bg-gray-700 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold mb-4">Activity Statistics</h3>
                  <dl className="space-y-3">
                    <div className="flex justify-between">
                      <dt className="text-gray-200">Total Visits</dt>
                      <dd className="font-medium">{summaryData.total_visits}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-gray-200">Total Incidents</dt>
                      <dd className="font-medium">{summaryData.total_incidents}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-gray-200">Incidents Today</dt>
                      <dd className="font-medium">{summaryData.incidents_today}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-gray-200">Security Personnel</dt>
                      <dd className="font-medium">{summaryData.security_personnel_count}</dd>
                    </div>
                  </dl>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}