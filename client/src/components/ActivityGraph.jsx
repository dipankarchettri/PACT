import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';

const ActivityGraph = ({ type, username, data, embedded = false }) => {
    const [calendarData, setCalendarData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            const today = new Date();
            const oneYearAgo = new Date();
            oneYearAgo.setDate(today.getDate() - 365);

            const allDays = [];
            // Create a map for quick lookup
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
            } else if (type === 'leetcode' && data) {
                try {
                    const parsedData = typeof data === 'string' ? JSON.parse(data) : data;
                    Object.entries(parsedData).forEach(([ts, count]) => {
                        const date = new Date(parseInt(ts) * 1000).toISOString().split('T')[0];
                        dateCountMap.set(date, count);
                    });
                } catch (error) {
                    console.error('Error parsing LeetCode calendar:', error);
                }
            }

            // Fill in the data array
            for (let d = new Date(oneYearAgo); d <= today; d.setDate(d.getDate() + 1)) {
                const dateStr = d.toISOString().split('T')[0];
                const count = dateCountMap.get(dateStr) || 0;

                // Binary Level: If count > 0, set to max level (4), else 0
                const level = count > 0 ? 4 : 0;

                allDays.push({
                    date: dateStr,
                    count: count,
                    level: level
                });
            }

            setCalendarData(allDays);
            setLoading(false);
        };

        fetchData();
    }, [type, username, data]);

    // Use separate themes for GitHub and LeetCode (Pastel Palette)
    const theme = {
        github: {
            light: ['#f0fdf4', '#dcfce7', '#86efac', '#4ade80', '#22c55e'], // Pastel Mint/Green
        },
        leetcode: {
            light: ['#fff7ed', '#ffedd5', '#fdba74', '#fb923c', '#f97316'], // Pastel Peach/Orange
        }
    };

    // Get theme based on type
    const currentTheme = type === 'leetcode' ? theme.leetcode : theme.github;

    // Group data into weeks for vertical layout
    const weeks = [];
    let currentWeek = [];

    // Pad the first week if data doesn't start on Sunday
    if (calendarData.length > 0) {
        const firstDate = new Date(calendarData[0].date);
        const dayOfWeek = firstDate.getDay(); // 0 = Sunday
        for (let i = 0; i < dayOfWeek; i++) {
            currentWeek.push(null); // Empty placeholder
        }
    }

    calendarData.forEach((day, index) => {
        currentWeek.push(day);
        if (currentWeek.length === 7) {
            weeks.push(currentWeek);
            currentWeek = [];
        }
    });

    // Push remaining days
    if (currentWeek.length > 0) {
        weeks.push(currentWeek);
    }

    if (loading) return <div className="h-32 flex items-center justify-center text-muted-foreground text-xs">Loading graph...</div>;

    const getLevelColor = (level, theme) => {
        // level 0 (inactive) or 4 (active)
        // If level > 0, use index 4 (darkest), else index 0
        return level > 0 ? theme.light[4] : theme.light[0];
    };

    const countLabel = type === 'leetcode' ? 'questions' : 'contributions';
    const totalCount = calendarData.reduce((acc, day) => acc + (day.count || 0), 0);

    const content = (
        <div className={`w-full ${embedded ? 'mt-4' : ''}`}>
            <div className="flex justify-between items-center mb-2 text-xs text-muted-foreground px-1">
                <span>{totalCount} {countLabel} in last year</span>
            </div>

            {/* Full Width Responsive Area */}
            <div className="w-full pb-2">
                <div className="flex w-full gap-[3px]">
                    {/* Render Weeks (Chronological order) */}
                    {weeks.map((week, wIndex) => {
                        const firstDay = week.find(d => d !== null);
                        const showMonth = firstDay && new Date(firstDay.date).getDate() <= 7;

                        return (
                            <div key={wIndex} className="flex-1 flex flex-col gap-[3px]">
                                {/* Days in Week */}
                                {week.map((day, dIndex) => (
                                    <div
                                        key={dIndex}
                                        className="w-full aspect-square rounded-[2px] border border-black/10 dark:border-white/10"
                                        style={{
                                            backgroundColor: day ? getLevelColor(day.level, currentTheme) : 'transparent',
                                            opacity: day ? 1 : 0
                                        }}
                                        title={day ? `${day.count} ${countLabel} on ${day.date}` : ''}
                                    />
                                ))}

                                {/* Month Label (Below the column) */}
                                <div className="h-3 text-[9px] text-muted-foreground text-center overflow-visible whitespace-nowrap">
                                    {showMonth ? new Date(firstDay.date).toLocaleString('default', { month: 'short' }) : ''}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );

    if (embedded) return content;

    return (
        <Card className="w-full overflow-hidden">
            <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                    {type === 'github' ? 'GitHub Contributions' : 'LeetCode Submissions'}
                </CardTitle>
            </CardHeader>
            <CardContent className="flex justify-center p-4">
                {content}
            </CardContent>
        </Card>
    );
};

export default ActivityGraph;
