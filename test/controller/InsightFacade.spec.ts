import {
	IInsightFacade,
	InsightDatasetKind,
	InsightError, InsightResult,
	NotFoundError,
	ResultTooLargeError
} from "../../src/controller/IInsightFacade";
import InsightFacade from "../../src/controller/InsightFacade";
import chai, {expect} from "chai";
import {folderTest} from "@ubccpsc310/folder-test";

import {clearDisk, getDataFromArchive} from "../resources/TestUtil";
describe("InsightFacade", function () {
	let testContent: string;
	let testRoom: string;

	before(function (){
		testContent = getDataFromArchive("pair.zip");
		testRoom = getDataFromArchive("rooms.zip");
		this.timeout(10000);
	});

	describe("ListDataset", function () {
		let facade: IInsightFacade;

		beforeEach(function (){
			clearDisk();
			facade = new InsightFacade();
			this.timeout(10000);
		});
		it("should list no dataset", function (){
			return facade.listDatasets().then((dataSets) => {
				expect(dataSets).to.be.an.instanceof(Array);
				expect(dataSets).to.have.length(0);
			});
		});

		it("should list one dataset", function (){
			this.timeout(10000);
			return facade.addDataset("sections", testContent, InsightDatasetKind.Sections)
				.then((addedIDs) => facade.listDatasets())
				.then((dataSet) => {
					expect(dataSet).to.deep.equal([{
						id: "sections",
						kind: InsightDatasetKind.Sections,
						numRows: 64612
					}]);

				}).catch(function (err) {
					expect.fail("should pass");
				});
		});

		it("should list multiple datasets", function (){
			this.timeout(10000);
			return facade.addDataset("sections", testContent, InsightDatasetKind.Sections)
				.then(() => {
					return facade.addDataset("sections-2", testContent, InsightDatasetKind.Sections);
				})
				.then((addedIDs) => facade.listDatasets())
				.then((dataSet) => {
					expect(dataSet).to.deep.equal([
						{
							id: "sections",
							kind: InsightDatasetKind.Sections,
							numRows: 64612
						},
						{
							id: "sections-2",
							kind: InsightDatasetKind.Sections,
							numRows: 64612
						}]);

				});
		});
	});

	describe("addDataSet", function () {
		let facade: IInsightFacade;

		beforeEach(function(){
			clearDisk();
			facade = new InsightFacade();
			this.timeout(10000);
			// initiate new InsightFacade for testing
		});

		it("add one room data Set success", async function(){
			this.timeout(10000);
			return facade.addDataset("rooms", testRoom, InsightDatasetKind.Rooms)
				.then((addedIDs) => facade.listDatasets())
				.then((dataSet) => {
					expect(dataSet).to.deep.equal([{
						id: "rooms",
						kind: InsightDatasetKind.Rooms,
						numRows: 364
					}]);

				}).catch(function (err) {
					console.log(err);
					expect.fail("should pass");
				});
		});


		it("add one dataset success", async function () {
			this.timeout(10000);
			await facade.listDatasets().then((dataSet) =>{
				expect(dataSet).to.be.instanceof(Array);
				expect(dataSet).to.have.length(0);
			});
			await facade.addDataset("section", testContent, InsightDatasetKind.Sections);
			return facade.listDatasets().then((dataSet) =>{
				expect(dataSet).to.be.instanceof(Array);
				expect(dataSet).to.have.length(1);
			});
		});

		it("add one dataset fail due to underscore_id", async function(){
			this.timeout(10000);
			await facade.listDatasets().then((dataSet) =>{
				expect(dataSet).to.be.instanceof(Array);
				expect(dataSet).to.have.length(0);
			});
			try{
				await facade.addDataset("section_math", testContent, InsightDatasetKind.Sections);
				expect.fail("should reject");
			}catch (err){
				expect(err).to.be.instanceof(InsightError);
			}
			await facade.listDatasets().then((dataSet) =>{
				expect(dataSet).to.be.instanceof(Array);
				expect(dataSet).to.have.length(0);
			});
		});

		it("add one dataset fail due to white space id", async function() {
			this.timeout(10000);
			await facade.listDatasets().then((dataSet) =>{
				expect(dataSet).to.be.instanceof(Array);
				expect(dataSet).to.have.length(0);
			});
			try{
				await facade.addDataset("   ", testContent, InsightDatasetKind.Sections);
				expect.fail("should reject");
			}catch (err){
				expect(err).to.be.instanceof(InsightError);
			}
			await facade.listDatasets().then((dataSet) =>{
				expect(dataSet).to.be.instanceof(Array);
				expect(dataSet).to.have.length(0);
			});
		});

		it("add one dataset success due to not all white space id", async function() {
			this.timeout(10000);
			await facade.listDatasets().then((dataSet) =>{
				expect(dataSet).to.be.instanceof(Array);
				expect(dataSet).to.have.length(0);
			});
			await facade.addDataset("section math", testContent, InsightDatasetKind.Sections);
			await facade.listDatasets().then((dataSet) =>{
				expect(dataSet).to.be.instanceof(Array);
				expect(dataSet).to.have.length(1);
			});
		});


		it("add multiple dataset success", async function(){
			this.timeout(10000);
			await facade.listDatasets().then((dataSet) =>{
				expect(dataSet).to.be.instanceof(Array);
				expect(dataSet).to.have.length(0);
			});
			await facade.addDataset("section", testContent, InsightDatasetKind.Sections);
			await facade.addDataset("section-2", testContent, InsightDatasetKind.Sections);
			return facade.listDatasets().then((dataSet) =>{
				expect(dataSet).to.be.instanceof(Array);
				expect(dataSet).to.have.length(2);
			});
		});

		it("add multiple set fail due to same id", async function() {
			this.timeout(10000);
			await facade.listDatasets().then((dataSet) =>{
				expect(dataSet).to.be.instanceof(Array);
				expect(dataSet).to.have.length(0);
			});
			try{
				await facade.addDataset("section", testContent, InsightDatasetKind.Sections);
				await facade.addDataset("section", testContent, InsightDatasetKind.Sections);
				expect.fail("should reject");
			}catch (err){
				expect(err).to.be.instanceof(InsightError);
			}
			await facade.listDatasets().then((dataSet) =>{
				expect(dataSet).to.be.instanceof(Array);
				expect(dataSet).to.have.length(1);
			});
		});
	});

	describe("removeDataSet", function () {
		let facade: IInsightFacade;
		beforeEach(async function () {
			clearDisk();
			facade = new InsightFacade();
			this.timeout(10000);
			// await facade.addDataset("section math", testRoom, InsightDatasetKind.Rooms);
			await facade.addDataset("section math", testContent, InsightDatasetKind.Sections);
		});


		it("one remove success", async function() {
			this.timeout(10000);
			await facade.listDatasets().then((dataSet) => {
				this.timeout(10000);
				expect(dataSet).to.be.instanceof(Array);
				expect(dataSet).to.have.length(1);
			});
			await facade.removeDataset("section math");
			return facade.listDatasets().then((dataSet) => {
				expect(dataSet).to.be.instanceof(Array);
				expect(dataSet).to.have.length(0);
			});
		}).timeout(10000);

		it("remove failure due to underscore id, should produce InsightError", async function(){
			this.timeout(10000);
			await facade.listDatasets().then((dataSet) => {
				expect(dataSet).to.be.instanceof(Array);
				expect(dataSet).to.have.length(1);
			});
			try {
				await facade.removeDataset("section__");
			} catch (err){
				expect(err).to.be.instanceof(InsightError);
				return facade.listDatasets().then((dataSet) =>{
					expect(dataSet).to.be.instanceof(Array);
					expect(dataSet).to.have.length(1);
				});
			}
		});

		it("remove failure due to whitespace id, should produce InsightError", async function(){
			this.timeout(10000);
			await facade.listDatasets().then((dataSet) => {
				expect(dataSet).to.be.instanceof(Array);
				expect(dataSet).to.have.length(1);
			});
			try {
				await facade.removeDataset("      ");
			} catch (err){
				expect(err).to.be.instanceof(InsightError);
				return facade.listDatasets().then((dataSet) =>{
					expect(dataSet).to.be.instanceof(Array);
					expect(dataSet).to.have.length(1);
				});
			}
		});


		it("remove failure due to non-existent id, should produce NotFoundError", async function(){
			this.timeout(10000);
			await facade.listDatasets().then((dataSet) => {
				expect(dataSet).to.be.instanceof(Array);
				expect(dataSet).to.have.length(1);
			});
			try {
				await facade.removeDataset("section-1");
			} catch (err){
				expect(err).to.be.instanceof(NotFoundError);
				return facade.listDatasets().then((dataSet) =>{
					expect(dataSet).to.be.instanceof(Array);
					expect(dataSet).to.have.length(1);
				});
			}
		});
	});

	describe("performQuery", function () {
		let facade: IInsightFacade;
			// type of possible error in performQuery
			// variable setup to accommodate with dynamic testing environment
		type Err = "ResultTooLargeError" | "InsightError"

		before(function() {
			clearDisk();
			facade = new InsightFacade();
			this.timeout(10000);
			return facade.addDataset("sections", testContent, InsightDatasetKind.Sections).then((result) => "");
		});
		// it("query success, result check test", function(){})
		// it("query failure due to incorrect format, catch InsightError", function (){})
		// it("query failure due to non-existent dataset, catch InsightError", function(){})
		// it("query failure due to referring multiple dataset, catch InsightError", function(){})
		// it("query failure due to too many results returned (> 5000), catch resultTooLargeError", function(){})

		// Function from the template from https://www.npmjs.com/package/@ubccpsc310/folder-test
		// Require: handle error properly when an error is returned
		// Input: expected error in string, actual error as err defined in IInsightFacade.ts
		// output: assertion verifying whether actual matches expect
		function errorAssert(expected: Err, actual: any){
			if(expected === "ResultTooLargeError"){
				expect(actual).to.be.instanceof(ResultTooLargeError);
			} else if (expected === "InsightError"){
				expect(actual).to.be.instanceof(InsightError);
			}
		}

		// Function from the template from https://www.npmjs.com/package/@ubccpsc310/folder-test
		// Require: check result if there is any
		// Input: expected result and actual result with their input
		// output: assertion on whether two are the same
		function resultAssert(expected: any[], actual: any, query: any) {
			expect(expected).to.have.deep.members(actual);
			// return expected.then((set) => {
			//    expect(actual).to.be.an.instanceof(Array)
			//    expect(actual).to.have.length(set.length)
			//    expect(actual).to.have.deep.members(set)
			// })
		}
		this.timeout(10000);
		folderTest<any, Promise<any[]>, Err>(
			"perform Query test",
			(query: any): Promise<any[]> => facade.performQuery(query),
			"./test/resources/queries2",
			{
				assertOnError: errorAssert,
				assertOnResult: resultAssert,
			});
	});
});

