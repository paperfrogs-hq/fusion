// Security Monitoring Module - Track hack attempts and suspicious activities
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Shield, AlertTriangle, Ban, Eye, Search, Download, Activity, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/lib/supabase-client";

interface SecurityEvent {
  id: string;
  event_type: string;
  ip_address: string;
  user_agent: string;
  endpoint: string;
  request_method: string;
  request_body: any;
  response_status: number;
  threat_level: string;
  reason: string;
  detected_at: string;
  metadata: any;
  location?: string;
  blocked: boolean;
}

const SecurityMonitoringModule = () => {
  const [events, setEvents] = useState<SecurityEvent[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<SecurityEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterThreat, setFilterThreat] = useState<string>("all");
  const [selectedEvent, setSelectedEvent] = useState<SecurityEvent | null>(null);

  useEffect(() => {
    fetchSecurityEvents();
    // Refresh every 30 seconds
    const interval = setInterval(fetchSecurityEvents, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    let filtered = events;

    if (searchTerm) {
      filtered = filtered.filter(event =>
        event.ip_address.includes(searchTerm) ||
        event.endpoint.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.event_type.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterThreat !== "all") {
      filtered = filtered.filter(event => event.threat_level === filterThreat);
    }

    setFilteredEvents(filtered);
  }, [searchTerm, filterThreat, events]);

  const fetchSecurityEvents = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("security_events")
        .select("*")
        .order("detected_at", { ascending: false })
        .limit(500);

      if (error) throw error;
      setEvents(data || []);
      setFilteredEvents(data || []);
    } catch (error) {
      console.error("Error fetching security events:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const exportToCSV = () => {
    const headers = ['Date', 'IP Address', 'Event Type', 'Threat Level', 'Endpoint', 'Method', 'Status', 'Reason', 'Blocked'];
    const rows = filteredEvents.map(event => [
      new Date(event.detected_at).toLocaleString(),
      event.ip_address,
      event.event_type,
      event.threat_level,
      event.endpoint,
      event.request_method,
      event.response_status,
      event.reason,
      event.blocked ? 'Yes' : 'No'
    ]);

    const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `security-events-${Date.now()}.csv`;
    a.click();
  };

  const stats = {
    total: events.length,
    critical: events.filter(e => e.threat_level === 'critical').length,
    high: events.filter(e => e.threat_level === 'high').length,
    medium: events.filter(e => e.threat_level === 'medium').length,
    blocked: events.filter(e => e.blocked).length,
    uniqueIPs: new Set(events.map(e => e.ip_address)).size
  };

  const getThreatColor = (level: string) => {
    switch(level) {
      case 'critical': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  const getEventIcon = (type: string) => {
    switch(type) {
      case 'sql_injection': return Ban;
      case 'brute_force': return Shield;
      case 'unauthorized_access': return AlertTriangle;
      case 'suspicious_activity': return Eye;
      default: return Activity;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Security Monitoring</h2>
        <p className="text-gray-600">Track suspicious activities and hack attempts in real-time</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
            <p className="text-xs text-gray-500 mt-1">Total Events</p>
          </CardContent>
        </Card>
        <Card className="border-red-200">
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-red-600">{stats.critical}</div>
            <p className="text-xs text-gray-500 mt-1">Critical</p>
          </CardContent>
        </Card>
        <Card className="border-orange-200">
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-orange-600">{stats.high}</div>
            <p className="text-xs text-gray-500 mt-1">High Risk</p>
          </CardContent>
        </Card>
        <Card className="border-yellow-200">
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-yellow-600">{stats.medium}</div>
            <p className="text-xs text-gray-500 mt-1">Medium</p>
          </CardContent>
        </Card>
        <Card className="border-green-200">
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-green-600">{stats.blocked}</div>
            <p className="text-xs text-gray-500 mt-1">Blocked</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-gray-900">{stats.uniqueIPs}</div>
            <p className="text-xs text-gray-500 mt-1">Unique IPs</p>
          </CardContent>
        </Card>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search by IP, endpoint, or event type..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <select
          value={filterThreat}
          onChange={(e) => setFilterThreat(e.target.value)}
          className="px-4 py-2 border rounded-md"
        >
          <option value="all">All Threats</option>
          <option value="critical">Critical</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>
        <Button onClick={exportToCSV} variant="outline">
          <Download className="h-4 w-4 mr-2" />
          Export CSV
        </Button>
        <Button onClick={fetchSecurityEvents} variant="outline">
          <Activity className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Results Count */}
      <div className="text-sm text-gray-600">
        Showing {filteredEvents.length} of {events.length} security events
      </div>

      {/* Events Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Time</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">IP Address</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Event Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Threat Level</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Endpoint</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Method</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredEvents.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-12 text-center text-gray-500">
                      <Shield className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                      <p className="font-medium">No security events found</p>
                      <p className="text-sm mt-1">System is secure and monitoring for threats</p>
                    </td>
                  </tr>
                ) : (
                  filteredEvents.map((event) => {
                    const EventIcon = getEventIcon(event.event_type);
                    return (
                      <motion.tr
                        key={event.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="hover:bg-gray-50"
                      >
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {new Date(event.detected_at).toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <div className="flex items-center gap-2">
                            <Globe className="h-4 w-4 text-gray-400" />
                            <code className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">
                              {event.ip_address}
                            </code>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <div className="flex items-center gap-2">
                            <EventIcon className="h-4 w-4 text-gray-600" />
                            <span className="capitalize">{event.event_type.replace('_', ' ')}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium text-white ${getThreatColor(event.threat_level)}`}>
                            {event.threat_level.toUpperCase()}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">
                          {event.endpoint}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <Badge variant="outline">{event.request_method}</Badge>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <Badge variant={event.blocked ? "destructive" : "secondary"}>
                            {event.blocked ? "Blocked" : event.response_status}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setSelectedEvent(event)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </td>
                      </motion.tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Event Detail Modal */}
      {selectedEvent && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-auto"
          >
            <div className="p-6 border-b">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold">Security Event Details</h3>
                <Button variant="ghost" size="sm" onClick={() => setSelectedEvent(null)}>×</Button>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">IP Address</p>
                  <code className="text-sm font-mono bg-gray-100 px-2 py-1 rounded">{selectedEvent.ip_address}</code>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Event Type</p>
                  <p className="text-sm capitalize">{selectedEvent.event_type.replace('_', ' ')}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Threat Level</p>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium text-white ${getThreatColor(selectedEvent.threat_level)}`}>
                    {selectedEvent.threat_level.toUpperCase()}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Detected At</p>
                  <p className="text-sm">{new Date(selectedEvent.detected_at).toLocaleString()}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-sm font-medium text-gray-500">Endpoint</p>
                  <code className="text-sm bg-gray-100 px-2 py-1 rounded block mt-1">{selectedEvent.endpoint}</code>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Method</p>
                  <Badge>{selectedEvent.request_method}</Badge>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Status</p>
                  <Badge variant={selectedEvent.blocked ? "destructive" : "secondary"}>
                    {selectedEvent.blocked ? "Blocked" : selectedEvent.response_status}
                  </Badge>
                </div>
                <div className="col-span-2">
                  <p className="text-sm font-medium text-gray-500">Reason</p>
                  <p className="text-sm mt-1">{selectedEvent.reason}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-sm font-medium text-gray-500">User Agent</p>
                  <code className="text-xs bg-gray-100 px-2 py-1 rounded block mt-1 break-all">{selectedEvent.user_agent}</code>
                </div>
                {selectedEvent.metadata && (
                  <div className="col-span-2">
                    <p className="text-sm font-medium text-gray-500">Additional Metadata</p>
                    <pre className="text-xs bg-gray-100 p-2 rounded mt-1 overflow-auto">{JSON.stringify(selectedEvent.metadata, null, 2)}</pre>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default SecurityMonitoringModule;
