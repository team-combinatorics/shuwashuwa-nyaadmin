import { format } from 'date-fns';
import { TimeSlot } from '~/models/activity';

/* convert timestamp to YYYY-MM-DD hh:mm:ss */
export const formatDate = (timestamp: number) => {
    return format(new Date(timestamp), 'yyyy-MM-dd HH:mm:ss');
}

/* convert YYYY-MM-DD hh:mm:ss to timestamp */
export const parseDate = (date: string) => {
    return Date.parse(date);
}

/**
 * split TimeSlots
 * @param start startTime in YYYY-MM-DD hh:mm:ss
 * @param end endTime in YYYY-MM-DD hh:mm:ss
 * @param interval interval in minutes
 * @returns TimeSlot[]
 */
export const splitTimeSlots = (start: string, end: string, interval: number) => {
    const startTime = parseDate(start);
    const endTime = parseDate(end);
    const diff = endTime - startTime;
    const step = interval * 60 * 1000;
    const stepCount = Math.floor(diff / step);
    const result: TimeSlot[] = [];

    for (let i = 0; i < stepCount; i++) {
        result.push({
            timeSlot: i,
            startTime: formatDate(startTime + i * step),
            endTime: formatDate(startTime + (i + 1) * step)
        });
    }

    // unable to divide
    if (startTime + stepCount * step !== endTime) {
        result.push({
            timeSlot: stepCount,
            startTime: formatDate(startTime + stepCount * step),
            endTime: formatDate(endTime)
        });
    }

    return result;
}