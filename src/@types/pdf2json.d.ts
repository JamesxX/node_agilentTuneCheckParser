/// <reference types="node" />

declare module 'pdf2json'{
    import { EventEmitter } from "events";
    import {Transform, Readable} from "stream"

    declare class ParserStream extends Transform {
        static createContentStream(jsonObj: object);
        static createOutputStream(outputPath, callback)

        #pdfParser = null;
        #chunks = [];
        #parsedData = {Pages:[]};
        #_flush_callback = null; 

        constructor(pdfParser, options)

        //implements transform stream
	    _transform(chunk, enc, callback);
        _flush(callback);
        _destroy()
    }

    declare interface PDFParser {
        on(eventName: 'pdfParser_dataError', listener: (err: {parserError: any}) => void ): this
        on(eventName: 'pdfParser_dataReady', listener: (pdfData: any) => void ): this
        on(eventName: 'readable', listener: (meta: any) => void ): this
        on(eventName: 'data', listener: (page?: any) => void ): this
        on(eventName: 'error', listener: (err: any) => void ): this
    }

    declare class PDFParser extends EventEmitter {

        //public static
        static get colorDict() : string[];
        static get fontFacedict() : string[];
        static get fontStyleDict() : [number, number, number, number][];
        
        //private static   
        static #maxBinBufferCount: number;
        static #binBuffer = {};

        //private
        #password: string | null ;

        #context = null;

        #pdfFilePath : string | null = null; //current PDF file to load and parse, null means loading/parsing not started
        #pdfFileMTime = null; // last time the current pdf was modified, used to recognize changes and ignore cache
        #data = null; //if file read success, data is PDF content; if failed, data is "err" object
        #PDFJS = null; //will be initialized in constructor
        #processFieldInfoXML : boolean = false; //disable additional _fieldInfo.xml parsing and merging (do NOT set to true)
    
        // constructor
        constructor( context?, needRawText?: string, password?: string );

        // Preivate methods, needs to invoked by [funcName].call(this, ...)
        #onPDFJSParseDataReady(data);
        #onPDFJSParserDataError(err);
        #startParsingPDF(buffer);
        #processBinaryCache();

        //public getter
        get data() : typeof #data;
        get binBufferKey();

        //public APIs
        createParserStream() : ParserStream;
        async loadPDF(pdfFilePath: string, verbosity?: number);

        // Introduce a way to directly process buffers without the need to write it to a temporary file
	    parseBuffer(pdfBuffer: Buffer): void

        getRawTextContent(): string;
        getRawTextContentStream() : Readable;
    
        getAllFieldsTypes();
        getAllFieldsTypesStream() : Readable;
    
        getMergedTextBlocksIfNeeded() : 
            {
                Pages: {
                    Width: number,
                    Height: number,
                    HLines: any;
                    VLineS: any;
                    Fills: any,
                    Texts: any[],
                    Fields: any[],
                    Boxsets: any[]
                }[]
            }

        getMergedTextBlocksStream() : Readable;

        destroy();
    }

    export default PDFParser;
}

