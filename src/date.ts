const millisecondsPerDay = 24 * 60 * 60 * 1000;

const pad = (value: number): string => {
    return String(value).padStart(2, '0');
};

export const getDateBefore = (days: number): Date => {
    return new Date(Date.now() - days * millisecondsPerDay);
};

export const formatDate = (date: Date): string => {
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
};

export const formatApiDate = (date: Date): string => {
    return `${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}`;
};

export const formatDateTime = (date: Date): string => {
    return `${formatDate(date)} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
};
