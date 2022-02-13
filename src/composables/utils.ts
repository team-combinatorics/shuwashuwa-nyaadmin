export const groupBy = (arr: any, criteria: string) => {
    const newObj = arr.reduce((acc: any, currentValue: any) => {
        if (!acc[currentValue[criteria]]) {
            acc[currentValue[criteria]] = [];
        }
        acc[currentValue[criteria]].push(currentValue);
        return acc;
    }, {});
    return newObj;
}

export const fileToBase64 = (file: Blob) => {
    return new Promise((res, rej) => {
        const reader = new FileReader();
        reader.onload = e => res(e.target?.result);
        reader.onerror = e => rej(e);
        reader.readAsDataURL(file);
    });
}