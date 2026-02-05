import { XMLParser } from "fast-xml-parser";

export interface ParsedString {
    name: string;
    value: string;
}

export class AndroidXmlParser {
    private parser: XMLParser;

    constructor() {
        this.parser = new XMLParser({
            ignoreAttributes: false,
            attributeNamePrefix: "@_",
            textNodeName: "#text",
            parseTagValue: false, // Keep values as strings
            trimValues: true,
            stopNodes: ["*.string"] // Do not parse inside string tags if they contain HTML-like content, but usually we just want text. 
            // Actually standard fast-xml-parser behavior might be enough if we just read .string 
        });
    }

    parse(xmlContent: string): ParsedString[] {
        const jsonObj = this.parser.parse(xmlContent);
        const resources = jsonObj.resources;

        if (!resources) {
            throw new Error("Invalid Android XML: Missing <resources> tag");
        }

        const strings = resources.string;
        const result: ParsedString[] = [];

        if (Array.isArray(strings)) {
            for (const s of strings) {
                if (s["@_name"]) {
                    // value might be direct text or object if it has attributes (usually it doesn't for simple strings)
                    // or if it has CDATA. fast-xml-parser handles CDATA automatically usually?
                    // Let's assume simple #text for now.
                    const value = typeof s === 'string' ? s : (s["#text"] || "");
                    result.push({ name: s["@_name"], value: String(value) });
                }
            }
        } else if (strings && typeof strings === 'object') {
            // Single string entry
            if (strings["@_name"]) {
                const value = typeof strings === 'string' ? strings : (strings["#text"] || "");
                result.push({ name: strings["@_name"], value: String(value) });
            }
        }

        return result;
    }
}
