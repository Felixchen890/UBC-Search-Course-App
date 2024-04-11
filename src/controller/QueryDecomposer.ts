
export class QueryDecomposer {
	private query: any;

	constructor(query: any) {
		this.query = query;
	}

	public getId() {
		let options = (this.query)["OPTIONS"];
		let columns = options["COLUMNS"];
		let id = columns[0].split("_", 2)[0];
		return id;
	}


}
