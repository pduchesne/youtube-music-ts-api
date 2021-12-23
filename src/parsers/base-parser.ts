export default class BaseParser {
    traverse(obj: any, ...path: string[]): any {
        if (obj) {
            if (Array.isArray(path) && path.length > 0)  {
                const subPath = path.slice(1);
                if (Array.isArray(obj) && path[0] === "*") {
                    const result = [];
                    for (let i = 0; i < obj.length; i++) {
                        const subObj = this.traverse(obj[i], ...subPath);
                        if (subObj) {
                            if (Array.isArray(subObj)) {
                                result.push(...subObj);
                            } else {
                                result.push(subObj);
                            }
                        }
                    }
                    return result;
                } else {
                    return this.traverse(obj[path[0]], ...subPath);
                }
            }
            return obj;
        }
        return undefined;
    }
}
