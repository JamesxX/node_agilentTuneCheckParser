import PDFParser from 'pdf2json'
import fs from 'fs'
import util from 'util'

export interface Tune {
    title: string,
    timestamp: string,
    tuneFile: string,
    instrument_name: string,
    instrument_serial: string,

    tune: {
        ionPolarity: boolean,
        emission: number,
        electronEnergy: number,
        filament: number,
        repeller: number,
        ionFocus: number,
        entranceLens: number,
        entranceLensOffset: number,
        ionBody: number,
        postExtractor1: number,
        postExtractor2: number,
        jetCleanFlow: number,
        PFTBA: boolean,
        massGain: number,
        massOffset: number,
        AMUGain: number,
        AMUOffset: number,
        width219: number,
        DCPolarity: boolean,
        HEDEnable: boolean,
        EMVolts: number,
        extractorLens: number,
        scanSpeed: number,
        averages: number
    },

    tuneIons: {
        targetmz: number,
        actualmz: number,
        abundance: number,
        relativeAbundance: string,
        pw50: number,
        isomz: number,
        isoAbundance: number,
        isoRatio: string
    }[]

    scanIons:{
        low: number,
        high: number,
        step: number,
        speed: number,
        threshold: number,
        peaks: number,
        base: number,
        abundance: number,
        totalIon: number
    },

    tempsAndPressures : {
        sourceTemp: number,
        quadTemp: number,
        turboSpeed: number,
        hiVac: string,
        interfaceTemp: number
    },

    airwater : {
        h2o: number,
        n2: number,
        o2: number,
        co2: number,
    }

    flows : {
        col1: number,
        col2: number,
    }
}

export default class AgilentTuneEvalParser{
    #parser = new PDFParser();
    #tune?: Tune;

    constructor( PDFBuffer: Buffer ){
        this.#parser.on("pdfParser_dataReady", this.dataReady.bind(this) )
        this.#parser.parseBuffer(PDFBuffer)
    }

    fromXY(PDFData: any, x: number, y: number) : string {
        for ( const text of PDFData.Pages[0].Texts ){
            if ( text.x == x && text.y == y ){
                return decodeURIComponent(text.R[0].T).replace(",", "").replace(",", "")
            }
        }
        return ""
    }

    dataReady( pdfData: any ){
        this.#tune = {
            title: this.fromXY(pdfData, 15.036, 2.256 ),
            timestamp: this.fromXY(pdfData, 2.626, 3.138 ),
            tuneFile: this.fromXY(pdfData, 2.626, 4.038 ),
            instrument_name: this.fromXY(pdfData, 31.506, 3.138),
            instrument_serial: this.fromXY(pdfData, 30.521,4.038),

            tune : {
                ionPolarity: this.fromXY(pdfData, 26.088, 5.055) == 'Pos',
                emission: parseFloat(this.fromXY(pdfData, 25.841, 5.838)),
                electronEnergy: parseFloat(this.fromXY(pdfData, 25.841, 6.617)),
                filament: parseFloat(this.fromXY(pdfData, 26.556, 7.4)),
                repeller: parseFloat(this.fromXY(pdfData, 25.841, 8.182)),
                ionFocus: parseFloat(this.fromXY(pdfData, 25.841, 8.961)),
                entranceLens: parseFloat(this.fromXY(pdfData, 25.841, 9.744)),
                entranceLensOffset: parseFloat(this.fromXY(pdfData, 25.562, 10.522)),
                ionBody: parseFloat(this.fromXY(pdfData, 25.841, 11.306)),
                postExtractor1: parseFloat(this.fromXY(pdfData, 26.556, 12.084)),
                postExtractor2: parseFloat(this.fromXY(pdfData, 26.556, 12.867)),
                jetCleanFlow: parseFloat(this.fromXY(pdfData, 26.556, 13.645)),
                PFTBA: this.fromXY(pdfData, 32.541, 5.055) == 'Open',
                massGain: parseFloat(this.fromXY(pdfData, 32.708, 5.838)),
                massOffset: parseFloat(this.fromXY(pdfData, 32.942, 6.617)),
                AMUGain: parseFloat(this.fromXY(pdfData, 32.587, 7.4)),
                AMUOffset: parseFloat(this.fromXY(pdfData, 32.15, 8.182)),
                width219: parseFloat(this.fromXY(pdfData, 32.227, 8.961)),
                DCPolarity: this.fromXY(pdfData, 32.942, 9.744) == 'Pos',
                HEDEnable: this.fromXY(pdfData, 33.077, 10.522) == 'On',
                EMVolts: parseFloat(this.fromXY(pdfData, 32.15, 11.306)),
                extractorLens: parseFloat(this.fromXY(pdfData, 32.505, 12.084)),
                scanSpeed: parseFloat(this.fromXY(pdfData, 33.419, 12.867)),
                averages: parseFloat(this.fromXY(pdfData, 33.419, 13.645)),
            },

            tuneIons : [
                { // 69 Da
                    targetmz:parseFloat(this.fromXY(pdfData, 5.222, 30.111)),
                    actualmz:parseFloat(this.fromXY(pdfData, 9.569, 30.111)),
                    abundance:parseFloat(this.fromXY(pdfData, 13.367, 30.111)),
                    relativeAbundance:this.fromXY(pdfData, 17.804, 30.111),
                    pw50:parseFloat(this.fromXY(pdfData, 17.305, 16.116)),
                    isomz:parseFloat(this.fromXY(pdfData, 22.619, 30.111)),
                    isoAbundance:parseFloat(this.fromXY(pdfData, 26.971, 30.111)),
                    isoRatio:this.fromXY(pdfData, 31.407, 30.111)
                },
                { // 219 Da
                    targetmz:parseFloat(this.fromXY(pdfData, 4.947, 30.953)),
                    actualmz:parseFloat(this.fromXY(pdfData, 9.294, 30.953)),
                    abundance:parseFloat(this.fromXY(pdfData, 13.367, 30.953)),
                    relativeAbundance:this.fromXY(pdfData, 12.958, 16.957),
                    pw50:parseFloat(this.fromXY(pdfData, 17.305, 16.957)),
                    isomz:parseFloat(this.fromXY(pdfData, 22.345, 30.953)),
                    isoAbundance:parseFloat(this.fromXY(pdfData, 26.696, 30.953)),
                    isoRatio:this.fromXY(pdfData, 31.407, 30.953)
                },
                { // 502 Da
                    targetmz:parseFloat(this.fromXY(pdfData, 4.947, 31.798000000000002)),
                    actualmz:parseFloat(this.fromXY(pdfData, 9.294, 31.798000000000002)),
                    abundance:parseFloat(this.fromXY(pdfData, 13.646, 31.798000000000002)),
                    relativeAbundance:this.fromXY(pdfData, 18.083, 31.798000000000002),
                    pw50:parseFloat(this.fromXY(pdfData, 32.15, 11.306)),
                    isomz:parseFloat(this.fromXY(pdfData, 17.305, 17.803)),
                    isoAbundance:parseFloat(this.fromXY(pdfData, 26.971, 31.798000000000002)),
                    isoRatio:this.fromXY(pdfData, 31.407, 31.798000000000002)
                },
            ],

            scanIons: {
                low: parseFloat(this.fromXY(pdfData, 3.103, 19.851)),
                high: parseFloat(this.fromXY(pdfData, 5.888, 19.851)),
                step: parseFloat(this.fromXY(pdfData, 9.092, 19.851)),
                speed: parseFloat(this.fromXY(pdfData, 12.373, 19.851)),
                threshold: parseFloat(this.fromXY(pdfData, 15.023, 19.851)),
                peaks: parseFloat(this.fromXY(pdfData, 17.948, 19.851)),
                base: parseFloat(this.fromXY(pdfData, 20.513, 19.851)),
                abundance: parseFloat(this.fromXY(pdfData, 23.411, 19.851)),
                totalIon: parseFloat(this.fromXY(pdfData, 26.683, 19.851)),
            },

            tempsAndPressures:{
                sourceTemp: parseFloat(this.fromXY(pdfData, 26.129, 15.913)),
                quadTemp: parseFloat(this.fromXY(pdfData, 26.129, 16.697)),
                turboSpeed: parseFloat(this.fromXY(pdfData, 32.55, 15.913)),
                hiVac: this.fromXY(pdfData, 32.992, 16.697),
                interfaceTemp: 0, // Filled late due to complexity of query
            },

            airwater: {
                h2o: 0, // Filled late due to complexity of query
                n2: 0, // Filled late due to complexity of query
                o2: 0, // Filled late due to complexity of query
                co2: 0, // Filled late due to complexity of query
            },

            flows : {
                col1: 0, // Filled late due to complexity of query
                col2: 0, // Filled late due to complexity of query
            }

        }

        // Complete Air/Water
        const awRegex = /Air\/Water Check:  H20 ~(\d*\.\d*)\%  N2 ~(\d*\.\d*)\%  O2 ~(\d*\.\d*)\%  CO2 ~(\d*\.\d*)\%/gm
        const aw = this.fromXY(pdfData, 2.396, 33.337);
        const matchedAW = awRegex.exec(aw)
        this.#tune.airwater.h2o = parseFloat(matchedAW![1] ?? "0")
        this.#tune.airwater.n2 = parseFloat(matchedAW![2] ?? "0")
        this.#tune.airwater.o2 = parseFloat(matchedAW![3] ?? "0")
        this.#tune.airwater.co2 = parseFloat(matchedAW![4] ?? "0")

        // complete flows and interface temperature
        const flowsRegex = /Column\(1\) Flow:  (\d*\.\d*)   Column\(2\):  (\d*\.\d*) ml\/min    Interface Temp:  (\d*)/gm
        const flows = this.fromXY(pdfData, 2.396, 34.125);
        const matchedflows = flowsRegex.exec(flows)
        this.#tune.flows.col1 = parseFloat(matchedflows![1] ?? "0")
        this.#tune.flows.col2 = parseFloat(matchedflows![2] ?? "0")
        this.#tune.tempsAndPressures.interfaceTemp = parseFloat(matchedflows![3] ?? "0")

        console.log(this.#tune)
    }

}

fs.readFile("./2022-02-25-1004_etune.pdf", (err, pdfBuffer) => {
    if (!err) {
        const test = new AgilentTuneEvalParser(pdfBuffer)
    }
})
