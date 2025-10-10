import request from "supertest";
import { INestApplication } from "@nestjs/common";
import { createTestingApp } from "./utils/create-testing-app";

describe("Auth (e2e)", () => {
  let app: INestApplication;

  beforeAll(async () => {
    app = await createTestingApp();
  });

  afterAll(async () => {
    await app.close();
  });

  it("/health (GET) should be healthy", async () => {
    await request(app.getHttpServer())
      .get("/health")
      .expect(200)
      .expect((res) => {
        expect(res.body?.status).toBe("ok");
      });
  });
});
