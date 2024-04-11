import Server from "../../src/rest/Server";
import InsightFacade from "../../src/controller/InsightFacade";
import chai, {expect, use} from "chai";
import chaiHttp from "chai-http";
import * as fs from "fs";
import Log from "@ubccpsc310/folder-test/build/Log";
import {log} from "util";


describe("Server", function () {

	let facade: InsightFacade;
	let server: Server;

	use(chaiHttp);

	before(function () {
		facade = new InsightFacade();
		server = new Server(4321);
		// TODO: start server here once and handle errors properly
		try {
			server.start();
		} catch (e) {
			Log.info(e);
		}
	});

	after(function () {
		// TODO: stop server here once!
		server.stop();
	});

	beforeEach(function () {
		// might want to add some process logging here to keep track of what's going on
	});

	afterEach(function () {
		// might want to add some process logging here to keep track of what's going on
	});

	// Sample on how to format PUT requests
	/*
	it("PUT test for courses dataset", function () {
	 try {
	  return chai.request(SERVER_URL)
	   .put(ENDPOINT_URL)
	   .send(ZIP_FILE_DATA)
	   .set("Content-Type", "application/x-zip-compressed")
	   .then(function (res: ChaiHttp.Response) {
		// some logging here please!
		expect(res.status).to.be.equal(200);
	   })
	   .catch(function (err) {
		// some logging here please!
		expect.fail();
	   });
	 } catch (err) {
	  // and some more logging here!
	 }
	});
	*/

	// The other endpoints work similarly. You should be able to find all instructions at the chai-http documentation
	it("PUT test for courses dataset", function () {
		this.timeout(5000);
		try {
			return chai.request("http://localhost:4321")
				.put("/dataset/courses/sections")// todo:
				.send(fs.readFileSync("test/resources/archives/pair.zip"))
				.set("Content-Type", "application/x-zip-compressed")
				.then(function (res: ChaiHttp.Response) {
					// some logging here please!
					Log.info("Put courses dataset successfully");
					console.log(res.body);
					expect(res.body.result).to.be.deep.equal(["courses"]);
					expect(res.status).to.be.equal(200);
				})
				.catch(function (err) {
					// some logging here please!
					Log.info(err);
				});
		} catch (err) {
			// and some more logging here!
			Log.info(err);
		}
	});

	it("PUT test for rooms dataset", function () {
		this.timeout(4000);
		try {
			return chai.request("http://localhost:4321")
				.put("/dataset/rooms/rooms")// todo:
				.send(fs.readFileSync("./test/resources/archives/rooms.zip"))
				.set("Content-Type", "application/x-zip-compressed")
				.then(function (res: ChaiHttp.Response) {
					// some logging here please!
					Log.info("Put rooms dataset successfully");
					expect(res.status).to.be.equal(200);
				})
				.catch(function (err) {
					// some logging here please!
					Log.info(err);
				});
		} catch (err) {
			// and some more logging here!
			Log.info(err);
		}
	});

	it("DELETE test for rooms dataset", function () {
		this.timeout(4000);
		try {
			return chai.request("http://localhost:4321")
				.delete("/dataset/rooms")
				.then(function (res: ChaiHttp.Response) {
					// some logging here please!
					Log.info("delete with error");
					expect(res.status).to.be.equal(200);
				})
				.catch(function (err) {
					// some logging here please!
					Log.info(err);
				});
		} catch (err) {
			// and some more logging here!
			Log.info(err);
		}
	});

	it("DELETE test for courses dataset", function () {
		this.timeout(4000);
		try {
			return chai.request("http://localhost:4321")
				.delete("/dataset/courses")
				.then(function (res: ChaiHttp.Response) {
					// some logging here please!
					Log.info("delete successfully");
					expect(res.status).to.be.equal(200);
				})
				.catch(function (err) {
					// some logging here please!
					Log.info(err);
				});
		} catch (err) {
			// and some more logging here!
			Log.info(err);
		}
	});

	it("GET test for courses dataset", function () {
		this.timeout(4000);
		try {
			return chai.request("http://localhost:4321")
				.get("/datasets")
				.then(function (res: ChaiHttp.Response) {
					// some logging here please!
					Log.info("get successfully");
					expect(res.status).to.be.equal(200);
				})
				.catch(function (err) {
					// some logging here please!
					Log.info(err);
				});
		} catch (err) {
			// and some more logging here!
			Log.info(err);
		}
	});

	it("POST test for courses dataset",function() {
		this.timeout(4000);
		let query = {

			WHERE:{

				IS:{

					sections_avg:97

				}

			},

			OPTIONS:{

				COLUMNS:[

					"sections_dept",

					"sections_avg"

				],

				ORDER:"sections_avg"

			}

		};
		try {
			return chai.request("http://localhost:4321")
				.post("/query")
				.send(query)
				.then(function (res: ChaiHttp.Response) {
					// some logging here please!
					Log.info("get successfully");
					expect(res.status).to.be.equal(400);
				})
				.catch(function (err) {
					// some logging here please!
					Log.info(err);
				});
		} catch (err) {
			// and some more logging here!
			Log.info(err);
		}
	});

	it("POST test for rooms dataset",function() {
		this.timeout(4000);
		let query = {

			WHERE: {

				AND: [{

					IS: {

						rooms_furniture: "*Tables*"

					}

				}, {

					GT: {

						rooms_seats: 300

					}

				}]

			},

			OPTIONS: {

				COLUMNS: [

					"rooms_shortname",

					"maxSeats"

				],

				ORDER: {

					dir: "DOWN",

					keys: ["maxSeats"]

				}

			},

			TRANSFORMATIONS: {

				GROUP: ["rooms_shortname"],

				APPLY: [{

					maxSeats: {

						MAX: "rooms_seats"

					}

				}]

			}

		};
		try {
			return chai.request("http://localhost:4321")
				.post("/query")
				.send(query)
				.then(function (res: ChaiHttp.Response) {
					// some logging here please!
					Log.info("get successfully");
					expect(res.status).to.be.equal(400);
				})
				.catch(function (err) {
					// some logging here please!
					Log.info(err);
				});
		} catch (err) {
			// and some more logging here!
			Log.info(err);
		}
	});
});
