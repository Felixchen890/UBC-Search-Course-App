

export class CheckQueryType {
	private columnPart: any;

	constructor(columnPart: any) {
		this.columnPart = columnPart;
	}

	public typeCheck() {
		for (const c of this.columnPart) {
			if (c.includes("_")) {
				let keyPart = c.split("_")[1];
				if (keyPart === "avg" || keyPart === "pass" || keyPart === "fail" || keyPart === "audit"
					|| keyPart === "year" || keyPart === "dept" || keyPart === "id" || keyPart === "instructor"
					|| keyPart === "title" || keyPart === "uuid" ) {
					return "sections";
				} else {
					return "rooms";
				}
			}
		}
	}


}
