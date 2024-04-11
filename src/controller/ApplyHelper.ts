import Decimal from "decimal.js";

export class ApplyHelper{
	private applyPart: any;

	constructor(applyPart: any) {
		this.applyPart = applyPart;
	}

	public applyHandler(groupMap: any) {
		let appliedResult = this.getAppliedResult(groupMap);
		return appliedResult;
	}

	public getAppliedResult(groupMap: any) {
		let finalResult: any = [];
		let groupMapValues = groupMap.values();
		for (let results of groupMapValues) {
			// instead of all of apply parts
			for (let apply of this.applyPart) {
				let {applyKey, applyToken, keyValue} = this.setAppliedValue(apply);
				if(applyToken === "MAX"){
					// perform MAX
					let max: number = this.performMAX(results, keyValue);
					this.setResultValue(results, applyKey, max);
				}else if(applyToken === "MIN"){
					// perform MIN
					let min: number = this.performMIN(results, keyValue);
					this.setResultValue(results, applyKey, min);
				}else if(applyToken === "AVG"){
					// perform AVG
					let avg: number = this.performAVG(results, keyValue);
					this.setResultValue(results, applyKey, avg);
				}else if(applyToken === "SUM"){
					// perform SUM
					let sum: number = this.performSUM(results, keyValue);
					this.setResultValue(results, applyKey, sum);
				}else{
					// perform COUNT
					let count: number = this.performCOUNT(results, keyValue);
					this.setResultValue(results, applyKey, count);
				}
			}
			finalResult.push(results);
		}
		return finalResult;
	}

	public setResultValue(results: any, applyKey: string, applySolution: any) {
		for (let result of results) {
			result[applyKey] = applySolution;
		}
	}

	public setAppliedValue(apply: any) {
		let applyKey = Object.keys(apply)[0];
		let applyKeyValue = apply[applyKey];
		let applyToken = Object.keys(applyKeyValue)[0];
		let keyValue = applyKeyValue[applyToken].split("_")[1];
		return {applyKey, applyToken, keyValue};
	}

	private performMIN(results: any, keyValue: any) {
		let min = Infinity;
		for(const result of results){
			if(result[keyValue] < min){
				min = result[keyValue];
			}
		}
		return min;
	}

	private performAVG(results: any, keyValue: any) {
		let count = 0;
		let sum = new Decimal(0);
		for(const result of results){
			let curVal = new Decimal(result[keyValue]);
			sum = sum.add(curVal);
			count++;
		}
		let avg = sum.toNumber() / count;
		return Number(avg.toFixed(2));
	}

	private performSUM(results: any, keyValue: any) {
		let sum = new Decimal(0);
		for(const result of results){
			let curVal = new Decimal(result[keyValue]);
			sum = sum.add(curVal);
		}
		return Number(sum.toNumber().toFixed(2));
	}

	private performCOUNT(results: any, keyValue: any) {
		let seen: any[] = [];
		for(const result of results){
			if(!seen.includes(result[keyValue])){
				seen.push(result[keyValue]);
			}
		}
		return seen.length;
	}

	private performMAX(results: any[], key: any): number{
		let max = 0;
		for(const result of results){
			if(result[key] > max){
				max = result[key];
			}
		}
		return max;
	}
}
