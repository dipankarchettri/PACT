import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

const TimelineGraph = ({ type, username, data }) => {
    const [graphData, setGraphData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            const dateCountMap = new Map();

            if (type === 'github' && username) {
                try {
                    const response = await fetch(`https://github-contributions-api.jogruber.de/v4/${username}`);
                    const json = await response.json();

                    if (json.contributions) {
                        json.contributions.forEach(day => {
                            dateCountMap.set(day.date, day.count);
                        });
                    }
                } catch (error) {
                    console.error('Error fetching GitHub contributions:', error);
                }
            } else if ((type === 'leetcode' || type === 'github') && data) {
                try {
                    const parsedData = typeof data === 'string' ? JSON.parse(data) : data;
                    Object.entries(parsedData).forEach(([key, count]) => {
                        let date;
                        // Check if key is unix timestamp (seconds) or date string
                        if (!isNaN(key) && !key.includes('-')) {
                            date = new Date(parseInt(key) * 1000).toISOString().split('T')[0];
                        } else {
                            // Assume simplified date format YYYY-MM-DD
                            date = key; // Should already be in 'YYYY-MM-DD' if consistent
                            // Basic validation/normalization could go here
                        }

                        if (date) {
                            dateCountMap.set(date, count);
                        }
                    });
                } catch (error) {
                    console.error(`Error parsing ${type} calendar:`, error);
                }
            }

            // Aggregate by Week
            // Generate last 52 weeks
            const weeks = [];
            const today = new Date();
            // Start from 52 weeks ago
            const startDate = new Date();
            startDate.setDate(today.getDate() - (52 * 7));

            // Iterate day by day, summing up into weeks
            let currentWeekSum = 0;
            let currentWeekStart = new Date(startDate);
            let dayCounter = 0;

            for (let d = new Date(startDate); d <= today; d.setDate(d.getDate() + 1)) {
                const dateStr = d.toISOString().split('T')[0];
                const count = dateCountMap.get(dateStr) || 0;
                currentWeekSum += count;
                dayCounter++;

                if (dayCounter === 7) {
                    weeks.push({
                        date: currentWeekStart.toLocaleDateString('default', { month: 'short', day: 'numeric' }),
                        count: currentWeekSum
                    });
                    currentWeekSum = 0;
                    dayCounter = 0;
                    currentWeekStart = new Date(d);
                    currentWeekStart.setDate(currentWeekStart.getDate() + 1); // Next week start
                }
            }

            // Push partial last week if needed, or ignore to keep neat
            if (dayCounter > 0) {
                weeks.push({
                    date: currentWeekStart.toLocaleDateString('default', { month: 'short', day: 'numeric' }),
                    count: currentWeekSum
                });
            }

            setGraphData(weeks);
            setLoading(false);
        };

        fetchData();
    }, [type, username, data]);

    if (loading) return <div className="h-48 flex items-center justify-center text-muted-foreground">Loading timeline...</div>;
    if (graphData.length === 0) return null;

    const color = type === 'github' ? '#4ade80' : '#fb923c'; // Pastel Green : Pastel Orange
    const label = type === 'github' ? 'Contributions' : 'Questions';

    return (
        <Card className="w-full bg-white/50 backdrop-blur border-none shadow-none">
            <CardContent className="px-0">
                <div className="h-[200px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={graphData}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
                            <XAxis
                                dataKey="date"
                                tick={{ fontSize: 10 }}
                                tickLine={false}
                                axisLine={false}
                                minTickGap={30}
                            />
                            <YAxis
                                tick={{ fontSize: 10 }}
                                tickLine={false}
                                axisLine={false}
                                width={30}
                            />
                            <Tooltip
                                contentStyle={{ borderRadius: '8px', fontSize: '12px' }}
                                labelStyle={{ color: '#666' }}
                            />
                            <Line
                                type="monotone"
                                dataKey="count"
                                stroke={color}
                                strokeWidth={2}
                                dot={false}
                                activeDot={{ r: 4 }}
                                name={label}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    );
};

export default TimelineGraph;
