const supertest = require('supertest');
require('dotenv').config("../../.env");
const token=`Basic ${process.env.ACCESS_TOKEN}`
let todoId:string | null=null;
const Authorization="Authorization"
describe("Testing the todo api", () => {
  it("should get posts", async () => {
		const response = await supertest(process.env.API_URL).get('/todos')
    .set(Authorization, token) 
		expect(response.status).toEqual(200)
    expect(response.body).toHaveProperty('todos')

	});

  it('should return 400 if authorization header field is missed', async () => {
    await supertest(process.env.API_URL)
      .get(`/todos`)
      .expect(400)
  })
	it("should create a new post", async () => {

		const response = await supertest(process.env.API_URL).post('/todo/create')
    .set(Authorization, token) 
        .send({
            name:"todo1",
            description:"test",
            status:false,
            userId:String(process.env.USER_ID)
          });

		expect(response.status).toEqual(201);
    todoId=response?._body?.todo?._id;
	});
	it("should update a post", async () => {

		const response = await supertest(process.env.API_URL).put(`/todo/${todoId}/update`)
    .set(Authorization, token) 
        .send({
            name:"todo2",
            description:"test2",
            status:true
          });

		expect(response.status).toEqual(200);
	});
  it("should delete a post", async () => {
		const response = await supertest(process.env.API_URL).delete(`/todo/${todoId}/delete`)
    .set(Authorization, token) 
		expect(response.status).toEqual(200);
	});
});