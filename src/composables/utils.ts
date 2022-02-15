export const groupBy = (arr: Array<any>, criteria: string) => {
    const newObj = arr.reduce((acc: any, currentValue: any) => {
        if (!acc[currentValue[criteria]]) {
            acc[currentValue[criteria]] = [];
        }
        acc[currentValue[criteria]].push(currentValue);
        return acc;
    }, {});
    return newObj as Object;
}

export const objectMap  = <V extends keyof any> (obj: Object , fn: Function) =>
  Object.fromEntries(
    Object.entries(obj).map(
      ([k, v], i) => [k, fn(v, k, i)]
    )
  )

export const fileToBase64 = (file: Blob) => {
    return new Promise((res, rej) => {
        const reader = new FileReader();
        reader.onload = e => res(e.target?.result);
        reader.onerror = e => rej(e);
        reader.readAsDataURL(file);
    });
}