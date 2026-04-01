import { useState, useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { API_ENDPOINTS } from '../config/api';
import './DashboardOverview.css';

interface OverviewData {
  today_visitors: number;
  total_sessions: number;
  total_executions: number;
  active_users: number;
  total_page_views: number;
  avg_session_duration: number;
  code_success_rate: number;
}

interface DailyVisitor {
  date: string;
  visitors: number;
  sessions: number;
}

interface PageViewStat {
  page_path: string;
  page_title: string;
  views: number;
  avg_duration: number;
}

interface DeviceData {
  devices: { device_type: string; count: number }[];
  browsers: { browser: string; count: number }[];
  operating_systems: { os: string; count: number }[];
}

interface CodeStats {
  daily_stats: { date: string; total: number; success: number; failed: number }[];
  curriculum_stats: { curriculum_type: string; total: number; success: number }[];
  avg_execution_time_ms: number;
}

interface RecentActivity {
  type: string;
  session_id: string;
  detail: string;
  title: string;
  timestamp: string;
}

interface HourlyActivity {
  hour: string;
  activity_count: number;
}

interface MonthlyVisitor {
  month: string;
  visitors: number;
  sessions: number;
}

interface DailyMonthVisitor {
  date: string;
  visitors: number;
  sessions: number;
}

export default function DashboardOverview() {
  const [overview, setOverview] = useState<OverviewData | null>(null);
  const [dailyVisitors, setDailyVisitors] = useState<DailyVisitor[]>([]);
  const [pageViews, setPageViews] = useState<PageViewStat[]>([]);
  const [deviceData, setDeviceData] = useState<DeviceData | null>(null);
  const [codeStats, setCodeStats] = useState<CodeStats | null>(null);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [hourlyActivity, setHourlyActivity] = useState<HourlyActivity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDays, setSelectedDays] = useState(7);
  const [viewMode, setViewMode] = useState<'days' | 'year' | 'month'>('days');
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [availableYears, setAvailableYears] = useState<number[]>([new Date().getFullYear()]);
  const [yearlyVisitors, setYearlyVisitors] = useState<MonthlyVisitor[]>([]);
  const [monthlyDailyVisitors, setMonthlyDailyVisitors] = useState<DailyMonthVisitor[]>([]);

  const visitorsChartRef = useRef<SVGSVGElement>(null);
  const pageViewsChartRef = useRef<SVGSVGElement>(null);
  const deviceChartRef = useRef<SVGSVGElement>(null);
  const codeStatsChartRef = useRef<SVGSVGElement>(null);
  const hourlyChartRef = useRef<SVGSVGElement>(null);
  const yearlyChartRef = useRef<SVGSVGElement>(null);
  const monthlyChartRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (viewMode === 'days') {
      loadAllData();
    } else if (viewMode === 'year') {
      loadYearlyData();
    } else {
      loadMonthlyData();
    }
  }, [selectedDays, viewMode, selectedYear, selectedMonth]);

  useEffect(() => {
    if (viewMode === 'days' && dailyVisitors.length > 0) {
      drawVisitorsChart();
    }
  }, [dailyVisitors]);

  useEffect(() => {
    if (viewMode === 'year' && yearlyVisitors.length > 0) {
      drawYearlyChart();
    }
  }, [yearlyVisitors]);

  useEffect(() => {
    if (viewMode === 'month' && monthlyDailyVisitors.length > 0) {
      drawMonthlyChart();
    }
  }, [monthlyDailyVisitors]);

  useEffect(() => {
    if (viewMode === 'days' && pageViews.length > 0) {
      drawPageViewsChart();
    }
  }, [pageViews]);

  useEffect(() => {
    if (deviceData && deviceData.devices.length > 0) {
      drawDeviceChart();
    }
  }, [deviceData]);

  useEffect(() => {
    if (codeStats && codeStats.daily_stats.length > 0) {
      drawCodeStatsChart();
    }
  }, [codeStats]);

  useEffect(() => {
    if (hourlyActivity.length > 0) {
      drawHourlyChart();
    }
  }, [hourlyActivity]);

  const loadYearlyData = async () => {
    setIsLoading(true);
    const token = localStorage.getItem('admin_token');
    const headers = { 'Authorization': `Bearer ${token}` };

    try {
      const [yearsRes, yearlyRes] = await Promise.all([
        fetch(API_ENDPOINTS.analyticsAvailableYears, { headers }),
        fetch(`${API_ENDPOINTS.analyticsYearlyVisitors}?year=${selectedYear}`, { headers }),
      ]);

      if (yearsRes.ok) {
        const data = await yearsRes.json();
        setAvailableYears(data.data || [new Date().getFullYear()]);
      }

      if (yearlyRes.ok) {
        const data = await yearlyRes.json();
        setYearlyVisitors(data.data || []);
      }
    } catch (error) {
      console.error('Failed to load yearly data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadMonthlyData = async () => {
    setIsLoading(true);
    const token = localStorage.getItem('admin_token');
    const headers = { 'Authorization': `Bearer ${token}` };

    try {
      const [yearsRes, monthlyRes] = await Promise.all([
        fetch(API_ENDPOINTS.analyticsAvailableYears, { headers }),
        fetch(`${API_ENDPOINTS.analyticsMonthlyVisitors}?year=${selectedYear}&month=${selectedMonth}`, { headers }),
      ]);

      if (yearsRes.ok) {
        const data = await yearsRes.json();
        setAvailableYears(data.data || [new Date().getFullYear()]);
      }

      if (monthlyRes.ok) {
        const data = await monthlyRes.json();
        setMonthlyDailyVisitors(data.data || []);
      }
    } catch (error) {
      console.error('Failed to load monthly data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadAllData = async () => {
    setIsLoading(true);
    const token = localStorage.getItem('admin_token');
    const headers = { 'Authorization': `Bearer ${token}` };

    try {
      const [overviewRes, visitorsRes, pageViewsRes, devicesRes, codeRes, activityRes, hourlyRes] = await Promise.all([
        fetch(`${API_ENDPOINTS.analyticsOverview}?days=${selectedDays}`, { headers }),
        fetch(`${API_ENDPOINTS.analyticsDailyVisitors}?days=${selectedDays}`, { headers }),
        fetch(`${API_ENDPOINTS.analyticsPageViews}?days=${selectedDays}`, { headers }),
        fetch(API_ENDPOINTS.analyticsDevices, { headers }),
        fetch(`${API_ENDPOINTS.analyticsCodeStats}?days=${selectedDays}`, { headers }),
        fetch(`${API_ENDPOINTS.analyticsRecentActivity}?limit=15`, { headers }),
        fetch(`${API_ENDPOINTS.analyticsHourlyActivity}?days=${selectedDays}`, { headers }),
      ]);

      if (overviewRes.ok) {
        const data = await overviewRes.json();
        setOverview(data.data);
      }

      if (visitorsRes.ok) {
        const data = await visitorsRes.json();
        setDailyVisitors(data.data || []);
      }

      if (pageViewsRes.ok) {
        const data = await pageViewsRes.json();
        setPageViews(data.data || []);
      }

      if (devicesRes.ok) {
        const data = await devicesRes.json();
        setDeviceData(data.data);
      }

      if (codeRes.ok) {
        const data = await codeRes.json();
        setCodeStats(data.data);
      }

      if (activityRes.ok) {
        const data = await activityRes.json();
        setRecentActivity(data.data || []);
      }

      if (hourlyRes.ok) {
        const data = await hourlyRes.json();
        setHourlyActivity(data.data || []);
      }
    } catch (error) {
      console.error('Failed to load analytics data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const drawMonthlyChart = () => {
    if (!monthlyChartRef.current || monthlyDailyVisitors.length === 0) return;

    const svg = d3.select(monthlyChartRef.current);
    svg.selectAll('*').remove();

    const margin = { top: 20, right: 30, bottom: 50, left: 50 };
    const width = 560 - margin.left - margin.right;
    const height = 260 - margin.top - margin.bottom;

    const g = svg
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    const x = d3.scaleBand()
      .domain(monthlyDailyVisitors.map(d => d.date))
      .range([0, width])
      .padding(0.2);

    const y = d3.scaleLinear()
      .domain([0, d3.max(monthlyDailyVisitors, d => d.visitors) || 10])
      .nice()
      .range([height, 0]);

    g.selectAll('.bar')
      .data(monthlyDailyVisitors)
      .enter()
      .append('rect')
      .attr('class', 'bar')
      .attr('x', d => x(d.date) || 0)
      .attr('y', d => y(d.visitors))
      .attr('width', x.bandwidth())
      .attr('height', d => height - y(d.visitors))
      .attr('fill', '#764ba2')
      .attr('rx', 3);

    g.selectAll('.label')
      .data(monthlyDailyVisitors)
      .enter()
      .append('text')
      .attr('class', 'label')
      .attr('x', d => (x(d.date) || 0) + x.bandwidth() / 2)
      .attr('y', d => y(d.visitors) - 4)
      .attr('text-anchor', 'middle')
      .attr('fill', '#555')
      .attr('font-size', '9px')
      .text(d => d.visitors > 0 ? d.visitors : '');

    // X축: 5일 간격으로만 레이블 표시
    g.append('g')
      .attr('transform', `translate(0,${height})`)
      .call(
        d3.axisBottom(x).tickFormat((d, i) => {
          const day = Number(d.split('-')[2]);
          return (day === 1 || day % 5 === 0) ? `${day}일` : '';
        })
      )
      .selectAll('text')
      .attr('fill', '#666')
      .attr('font-size', '11px');

    g.append('g')
      .call(d3.axisLeft(y).ticks(5))
      .selectAll('text')
      .attr('fill', '#666');
  };

  const drawYearlyChart = () => {
    if (!yearlyChartRef.current || yearlyVisitors.length === 0) return;

    const svg = d3.select(yearlyChartRef.current);
    svg.selectAll('*').remove();

    const margin = { top: 20, right: 30, bottom: 50, left: 50 };
    const width = 560 - margin.left - margin.right;
    const height = 260 - margin.top - margin.bottom;

    const g = svg
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    const monthLabels = ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'];

    const x = d3.scaleBand()
      .domain(yearlyVisitors.map(d => d.month))
      .range([0, width])
      .padding(0.25);

    const y = d3.scaleLinear()
      .domain([0, d3.max(yearlyVisitors, d => d.visitors) || 10])
      .nice()
      .range([height, 0]);

    // Bars
    g.selectAll('.bar')
      .data(yearlyVisitors)
      .enter()
      .append('rect')
      .attr('class', 'bar')
      .attr('x', d => x(d.month) || 0)
      .attr('y', d => y(d.visitors))
      .attr('width', x.bandwidth())
      .attr('height', d => height - y(d.visitors))
      .attr('fill', '#667eea')
      .attr('rx', 4);

    // Value labels
    g.selectAll('.label')
      .data(yearlyVisitors)
      .enter()
      .append('text')
      .attr('class', 'label')
      .attr('x', d => (x(d.month) || 0) + x.bandwidth() / 2)
      .attr('y', d => y(d.visitors) - 5)
      .attr('text-anchor', 'middle')
      .attr('fill', '#555')
      .attr('font-size', '11px')
      .text(d => d.visitors > 0 ? d.visitors : '');

    // X Axis
    g.append('g')
      .attr('transform', `translate(0,${height})`)
      .call(d3.axisBottom(x).tickFormat((d, i) => monthLabels[i]))
      .selectAll('text')
      .attr('fill', '#666')
      .attr('font-size', '11px');

    // Y Axis
    g.append('g')
      .call(d3.axisLeft(y).ticks(5))
      .selectAll('text')
      .attr('fill', '#666');
  };

  const drawVisitorsChart = () => {
    if (!visitorsChartRef.current || dailyVisitors.length === 0) return;

    const svg = d3.select(visitorsChartRef.current);
    svg.selectAll('*').remove();

    const margin = { top: 20, right: 30, bottom: 40, left: 50 };
    const width = 500 - margin.left - margin.right;
    const height = 250 - margin.top - margin.bottom;

    const g = svg
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    const parseDate = d3.timeParse('%Y-%m-%d');
    const data = dailyVisitors.map(d => ({
      date: parseDate(d.date) || new Date(),
      visitors: d.visitors,
    }));

    const x = d3.scaleTime()
      .domain(d3.extent(data, d => d.date) as [Date, Date])
      .range([0, width]);

    const y = d3.scaleLinear()
      .domain([0, d3.max(data, d => d.visitors) || 10])
      .nice()
      .range([height, 0]);

    // Area
    const area = d3.area<{ date: Date; visitors: number }>()
      .x(d => x(d.date))
      .y0(height)
      .y1(d => y(d.visitors))
      .curve(d3.curveMonotoneX);

    g.append('path')
      .datum(data)
      .attr('fill', 'rgba(102, 126, 234, 0.2)')
      .attr('d', area);

    // Line
    const line = d3.line<{ date: Date; visitors: number }>()
      .x(d => x(d.date))
      .y(d => y(d.visitors))
      .curve(d3.curveMonotoneX);

    g.append('path')
      .datum(data)
      .attr('fill', 'none')
      .attr('stroke', '#667eea')
      .attr('stroke-width', 2.5)
      .attr('d', line);

    // Dots
    g.selectAll('.dot')
      .data(data)
      .enter()
      .append('circle')
      .attr('class', 'dot')
      .attr('cx', d => x(d.date))
      .attr('cy', d => y(d.visitors))
      .attr('r', 4)
      .attr('fill', '#667eea')
      .attr('stroke', '#fff')
      .attr('stroke-width', 2);

    // X Axis
    g.append('g')
      .attr('transform', `translate(0,${height})`)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .call(d3.axisBottom(x).ticks(5).tickFormat(d3.timeFormat('%m/%d') as any))
      .selectAll('text')
      .attr('fill', '#666');

    // Y Axis
    g.append('g')
      .call(d3.axisLeft(y).ticks(5))
      .selectAll('text')
      .attr('fill', '#666');
  };

  const drawPageViewsChart = () => {
    if (!pageViewsChartRef.current || pageViews.length === 0) return;

    const svg = d3.select(pageViewsChartRef.current);
    svg.selectAll('*').remove();

    const margin = { top: 20, right: 30, bottom: 100, left: 50 };
    const width = 500 - margin.left - margin.right;
    const height = 300 - margin.top - margin.bottom;

    const g = svg
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    const data = pageViews.slice(0, 8);

    const x = d3.scaleBand()
      .domain(data.map(d => d.page_path))
      .range([0, width])
      .padding(0.3);

    const y = d3.scaleLinear()
      .domain([0, d3.max(data, d => d.views) || 10])
      .nice()
      .range([height, 0]);

    // Bars
    g.selectAll('.bar')
      .data(data)
      .enter()
      .append('rect')
      .attr('class', 'bar')
      .attr('x', d => x(d.page_path) || 0)
      .attr('y', d => y(d.views))
      .attr('width', x.bandwidth())
      .attr('height', d => height - y(d.views))
      .attr('fill', '#764ba2')
      .attr('rx', 4);

    // Value labels
    g.selectAll('.label')
      .data(data)
      .enter()
      .append('text')
      .attr('class', 'label')
      .attr('x', d => (x(d.page_path) || 0) + x.bandwidth() / 2)
      .attr('y', d => y(d.views) - 5)
      .attr('text-anchor', 'middle')
      .attr('fill', '#666')
      .attr('font-size', '11px')
      .text(d => d.views);

    // X Axis
    g.append('g')
      .attr('transform', `translate(0,${height})`)
      .call(d3.axisBottom(x))
      .selectAll('text')
      .attr('transform', 'rotate(-45)')
      .attr('text-anchor', 'end')
      .attr('fill', '#666')
      .attr('font-size', '10px');

    // Y Axis
    g.append('g')
      .call(d3.axisLeft(y).ticks(5))
      .selectAll('text')
      .attr('fill', '#666');
  };

  const drawDeviceChart = () => {
    if (!deviceChartRef.current || !deviceData || deviceData.devices.length === 0) return;

    const svg = d3.select(deviceChartRef.current);
    svg.selectAll('*').remove();

    const width = 200;
    const height = 200;
    const radius = Math.min(width, height) / 2;

    const g = svg
      .attr('width', width)
      .attr('height', height)
      .append('g')
      .attr('transform', `translate(${width / 2},${height / 2})`);

    const color = d3.scaleOrdinal<string>()
      .domain(deviceData.devices.map(d => d.device_type))
      .range(['#667eea', '#764ba2', '#f093fb', '#f5576c']);

    const pie = d3.pie<{ device_type: string; count: number }>()
      .value(d => d.count)
      .sort(null);

    const arc = d3.arc<d3.PieArcDatum<{ device_type: string; count: number }>>()
      .innerRadius(radius * 0.5)
      .outerRadius(radius * 0.9);

    const arcs = g.selectAll('.arc')
      .data(pie(deviceData.devices))
      .enter()
      .append('g')
      .attr('class', 'arc');

    arcs.append('path')
      .attr('d', arc)
      .attr('fill', d => color(d.data.device_type))
      .attr('stroke', '#fff')
      .attr('stroke-width', 2);

    // Labels
    arcs.append('text')
      .attr('transform', d => `translate(${arc.centroid(d)})`)
      .attr('text-anchor', 'middle')
      .attr('font-size', '11px')
      .attr('fill', '#fff')
      .text(d => d.data.device_type);
  };

  const drawCodeStatsChart = () => {
    if (!codeStatsChartRef.current || !codeStats || codeStats.daily_stats.length === 0) return;

    const svg = d3.select(codeStatsChartRef.current);
    svg.selectAll('*').remove();

    const margin = { top: 20, right: 30, bottom: 40, left: 50 };
    const width = 500 - margin.left - margin.right;
    const height = 250 - margin.top - margin.bottom;

    const g = svg
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    const data = codeStats.daily_stats;

    const x = d3.scaleBand()
      .domain(data.map(d => d.date))
      .range([0, width])
      .padding(0.2);

    const y = d3.scaleLinear()
      .domain([0, d3.max(data, d => d.total) || 10])
      .nice()
      .range([height, 0]);

    // Success bars
    g.selectAll('.bar-success')
      .data(data)
      .enter()
      .append('rect')
      .attr('class', 'bar-success')
      .attr('x', d => x(d.date) || 0)
      .attr('y', d => y(d.success))
      .attr('width', x.bandwidth() / 2)
      .attr('height', d => height - y(d.success))
      .attr('fill', '#48bb78')
      .attr('rx', 2);

    // Failed bars
    g.selectAll('.bar-failed')
      .data(data)
      .enter()
      .append('rect')
      .attr('class', 'bar-failed')
      .attr('x', d => (x(d.date) || 0) + x.bandwidth() / 2)
      .attr('y', d => y(d.failed))
      .attr('width', x.bandwidth() / 2)
      .attr('height', d => height - y(d.failed))
      .attr('fill', '#f56565')
      .attr('rx', 2);

    // X Axis
    g.append('g')
      .attr('transform', `translate(0,${height})`)
      .call(d3.axisBottom(x).tickFormat(d => {
        const parts = d.split('-');
        return `${parts[1]}/${parts[2]}`;
      }))
      .selectAll('text')
      .attr('fill', '#666')
      .attr('font-size', '10px');

    // Y Axis
    g.append('g')
      .call(d3.axisLeft(y).ticks(5))
      .selectAll('text')
      .attr('fill', '#666');

    // Legend
    const legend = g.append('g')
      .attr('transform', `translate(${width - 100}, -10)`);

    legend.append('rect')
      .attr('x', 0)
      .attr('y', 0)
      .attr('width', 12)
      .attr('height', 12)
      .attr('fill', '#48bb78');

    legend.append('text')
      .attr('x', 16)
      .attr('y', 10)
      .attr('font-size', '11px')
      .attr('fill', '#666')
      .text('성공');

    legend.append('rect')
      .attr('x', 50)
      .attr('y', 0)
      .attr('width', 12)
      .attr('height', 12)
      .attr('fill', '#f56565');

    legend.append('text')
      .attr('x', 66)
      .attr('y', 10)
      .attr('font-size', '11px')
      .attr('fill', '#666')
      .text('실패');
  };

  const drawHourlyChart = () => {
    if (!hourlyChartRef.current || hourlyActivity.length === 0) return;

    const svg = d3.select(hourlyChartRef.current);
    svg.selectAll('*').remove();

    const margin = { top: 20, right: 30, bottom: 40, left: 50 };
    const width = 600 - margin.left - margin.right;
    const height = 120 - margin.top - margin.bottom;

    const g = svg
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // 24시간 데이터 생성 (누락된 시간은 0으로)
    const allHours = Array.from({ length: 24 }, (_, i) => {
      const hourStr = i.toString().padStart(2, '0');
      const found = hourlyActivity.find(h => h.hour === hourStr);
      return { hour: hourStr, count: found ? found.activity_count : 0 };
    });

    const maxCount = d3.max(allHours, d => d.count) || 1;

    // 색상 스케일
    const colorScale = d3.scaleSequential(d3.interpolateYlOrRd)
      .domain([0, maxCount]);

    const cellWidth = width / 24;
    const cellHeight = height;

    // 히트맵 셀
    g.selectAll('.heatmap-cell')
      .data(allHours)
      .enter()
      .append('rect')
      .attr('class', 'heatmap-cell')
      .attr('x', (_, i) => i * cellWidth)
      .attr('y', 0)
      .attr('width', cellWidth - 2)
      .attr('height', cellHeight)
      .attr('fill', d => d.count === 0 ? '#f0f0f0' : colorScale(d.count))
      .attr('rx', 3)
      .append('title')
      .text(d => `${d.hour}시: ${d.count}건`);

    // 시간 레이블 (0, 6, 12, 18, 23)
    const labelHours = [0, 6, 12, 18, 23];
    g.selectAll('.hour-label')
      .data(labelHours)
      .enter()
      .append('text')
      .attr('class', 'hour-label')
      .attr('x', d => d * cellWidth + cellWidth / 2)
      .attr('y', cellHeight + 15)
      .attr('text-anchor', 'middle')
      .attr('font-size', '10px')
      .attr('fill', '#666')
      .text(d => `${d}시`);

    // 활동량 레이블 (각 셀 위에)
    g.selectAll('.count-label')
      .data(allHours)
      .enter()
      .append('text')
      .attr('class', 'count-label')
      .attr('x', (_, i) => i * cellWidth + cellWidth / 2)
      .attr('y', cellHeight / 2 + 4)
      .attr('text-anchor', 'middle')
      .attr('font-size', '9px')
      .attr('fill', d => d.count > maxCount / 2 ? '#fff' : '#333')
      .text(d => d.count > 0 ? d.count : '');
  };

  const formatDuration = (seconds: number): string => {
    if (seconds < 60) return `${Math.round(seconds)}초`;
    if (seconds < 3600) return `${Math.round(seconds / 60)}분`;
    return `${Math.round(seconds / 3600)}시간`;
  };

  const formatTimeAgo = (timestamp: string): string => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffMs = now.getTime() - time.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return '방금 전';
    if (diffMins < 60) return `${diffMins}분 전`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)}시간 전`;
    return `${Math.floor(diffMins / 1440)}일 전`;
  };

  if (isLoading) {
    return (
      <div className="dashboard-loading">
        <i className="fi fi-rr-spinner loading-spinner"></i>
        <p>데이터를 불러오는 중...</p>
      </div>
    );
  }

  return (
    <div className="dashboard-overview">
      {/* 기간 선택 */}
      <div className="period-selector">
        <span>기간:</span>
        <button
          className={viewMode === 'days' && selectedDays === 7 ? 'active' : ''}
          onClick={() => { setViewMode('days'); setSelectedDays(7); }}
        >
          7일
        </button>
        <button
          className={viewMode === 'days' && selectedDays === 14 ? 'active' : ''}
          onClick={() => { setViewMode('days'); setSelectedDays(14); }}
        >
          14일
        </button>
        <button
          className={viewMode === 'days' && selectedDays === 30 ? 'active' : ''}
          onClick={() => { setViewMode('days'); setSelectedDays(30); }}
        >
          30일
        </button>
        <button
          className={viewMode === 'year' ? 'active' : ''}
          onClick={() => setViewMode('year')}
        >
          연도별
        </button>
        <button
          className={viewMode === 'month' ? 'active' : ''}
          onClick={() => setViewMode('month')}
        >
          월별
        </button>
        {(viewMode === 'year' || viewMode === 'month') && (
          <select
            className="year-select"
            value={selectedYear}
            onChange={e => setSelectedYear(Number(e.target.value))}
          >
            {availableYears.map(y => (
              <option key={y} value={y}>{y}년</option>
            ))}
          </select>
        )}
        {viewMode === 'month' && (
          <select
            className="year-select"
            value={selectedMonth}
            onChange={e => setSelectedMonth(Number(e.target.value))}
          >
            {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
              <option key={m} value={m}>{m}월</option>
            ))}
          </select>
        )}
        <button className="refresh-btn" onClick={viewMode === 'year' ? loadYearlyData : viewMode === 'month' ? loadMonthlyData : loadAllData}>
          <i className="fi fi-rr-refresh"></i>
        </button>
      </div>

      {/* 통계 카드 */}
      <div className="stats-cards">
        <div className="stat-card primary">
          <div className="stat-icon">
            <i className="fi fi-rr-users"></i>
          </div>
          <div className="stat-info">
            <span className="stat-label">오늘 방문자</span>
            <span className="stat-value">{overview?.today_visitors || 0}</span>
          </div>
        </div>

        <div className="stat-card info">
          <div className="stat-icon">
            <i className="fi fi-rr-cursor"></i>
          </div>
          <div className="stat-info">
            <span className="stat-label">총 세션</span>
            <span className="stat-value">{overview?.total_sessions || 0}</span>
          </div>
        </div>

        <div className="stat-card success">
          <div className="stat-icon">
            <i className="fi fi-rr-play-circle"></i>
          </div>
          <div className="stat-info">
            <span className="stat-label">코드 실행</span>
            <span className="stat-value">{overview?.total_executions || 0}</span>
          </div>
        </div>

        <div className="stat-card warning">
          <div className="stat-icon">
            <i className="fi fi-rr-signal-alt"></i>
          </div>
          <div className="stat-info">
            <span className="stat-label">활성 사용자</span>
            <span className="stat-value">{overview?.active_users || 0}</span>
          </div>
        </div>
      </div>

      {/* 추가 통계 */}
      <div className="secondary-stats">
        <div className="secondary-stat">
          <i className="fi fi-rr-eye"></i>
          <span>페이지 조회 {overview?.total_page_views || 0}회</span>
        </div>
        <div className="secondary-stat">
          <i className="fi fi-rr-clock"></i>
          <span>평균 체류 {formatDuration(overview?.avg_session_duration || 0)}</span>
        </div>
        <div className="secondary-stat">
          <i className="fi fi-rr-check-circle"></i>
          <span>코드 성공률 {overview?.code_success_rate || 0}%</span>
        </div>
      </div>

      {/* 차트 그리드 */}
      <div className="charts-grid">
        {/* 방문자 추이 차트 */}
        {viewMode === 'days' && (
          <div className="chart-card">
            <h3><i className="fi fi-rr-chart-line-up"></i> 일별 방문자 추이</h3>
            {dailyVisitors.length > 0 ? (
              <svg ref={visitorsChartRef}></svg>
            ) : (
              <div className="no-data">데이터가 없습니다</div>
            )}
          </div>
        )}
        {viewMode === 'year' && (
          <div className="chart-card">
            <h3><i className="fi fi-rr-chart-line-up"></i> {selectedYear}년 월별 방문자</h3>
            <svg ref={yearlyChartRef}></svg>
          </div>
        )}
        {viewMode === 'month' && (
          <div className="chart-card">
            <h3><i className="fi fi-rr-chart-line-up"></i> {selectedYear}년 {selectedMonth}월 일별 방문자</h3>
            {monthlyDailyVisitors.length > 0 ? (
              <svg ref={monthlyChartRef}></svg>
            ) : (
              <div className="no-data">데이터가 없습니다</div>
            )}
          </div>
        )}

        {/* 페이지별 조회수 */}
        <div className="chart-card">
          <h3><i className="fi fi-rr-bars-staggered"></i> 페이지별 조회수</h3>
          {pageViews.length > 0 ? (
            <svg ref={pageViewsChartRef}></svg>
          ) : (
            <div className="no-data">데이터가 없습니다</div>
          )}
        </div>

        {/* 기기 분포 */}
        <div className="chart-card small">
          <h3><i className="fi fi-rr-mobile-notch"></i> 기기 분포</h3>
          {deviceData && deviceData.devices.length > 0 ? (
            <div className="device-chart-wrapper">
              <svg ref={deviceChartRef}></svg>
              <div className="device-legend">
                {deviceData.devices.map((d, i) => (
                  <div key={d.device_type} className="legend-item">
                    <span className="legend-color" style={{ backgroundColor: ['#667eea', '#764ba2', '#f093fb', '#f5576c'][i % 4] }}></span>
                    <span>{d.device_type}: {d.count}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="no-data">데이터가 없습니다</div>
          )}
        </div>

        {/* 코드 실행 통계 */}
        <div className="chart-card">
          <h3><i className="fi fi-rr-code-simple"></i> 코드 실행 통계</h3>
          {codeStats && codeStats.daily_stats.length > 0 ? (
            <svg ref={codeStatsChartRef}></svg>
          ) : (
            <div className="no-data">데이터가 없습니다</div>
          )}
        </div>
      </div>

      {/* 시간대별 활동 히트맵 */}
      <div className="hourly-heatmap-section">
        <div className="chart-card full-width">
          <h3><i className="fi fi-rr-heat"></i> 시간대별 활동 히트맵</h3>
          <p className="chart-description">각 시간대의 활동량을 색상 강도로 표현합니다. 셀에 마우스를 올리면 상세 정보를 볼 수 있습니다.</p>
          {hourlyActivity.length > 0 ? (
            <svg ref={hourlyChartRef}></svg>
          ) : (
            <div className="no-data">데이터가 없습니다</div>
          )}
        </div>
      </div>

      {/* 브라우저 및 OS 분포 */}
      {deviceData && (deviceData.browsers.length > 0 || deviceData.operating_systems.length > 0) && (
        <div className="distribution-section">
          <div className="distribution-card">
            <h3><i className="fi fi-rr-browser"></i> 브라우저</h3>
            <div className="distribution-list">
              {deviceData.browsers.slice(0, 5).map(b => (
                <div key={b.browser} className="distribution-item">
                  <span className="dist-name">{b.browser}</span>
                  <span className="dist-count">{b.count}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="distribution-card">
            <h3><i className="fi fi-rr-laptop"></i> 운영체제</h3>
            <div className="distribution-list">
              {deviceData.operating_systems.slice(0, 5).map(os => (
                <div key={os.os} className="distribution-item">
                  <span className="dist-name">{os.os}</span>
                  <span className="dist-count">{os.count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 최근 활동 */}
      <div className="recent-activity-section">
        <h3><i className="fi fi-rr-time-past"></i> 최근 활동</h3>
        {recentActivity.length > 0 ? (
          <div className="activity-list">
            {recentActivity.map((activity, index) => (
              <div key={index} className={`activity-item ${activity.type}`}>
                <div className="activity-icon">
                  {activity.type === 'page_view' ? (
                    <i className="fi fi-rr-eye"></i>
                  ) : (
                    <i className="fi fi-rr-play"></i>
                  )}
                </div>
                <div className="activity-content">
                  <span className="activity-detail">{activity.detail}</span>
                  <span className="activity-title">{activity.title}</span>
                </div>
                <div className="activity-time">
                  {formatTimeAgo(activity.timestamp)}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="no-data">최근 활동이 없습니다</div>
        )}
      </div>
    </div>
  );
}
