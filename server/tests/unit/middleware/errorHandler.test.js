const errorHandler = require("../../../middleware/errorHandler");

describe("errorHandler middleware", () => {
  let res;

  beforeEach(() => {
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
  });

  it("should handle CastError", () => {
    const err = { name: "CastError", message: "Invalid ID" };
    errorHandler(err, {}, res, {});

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      error: ["Resource not found"],
    });
  });

  it("should handle duplicate key error", () => {
    const err = { code: 11000, message: "Duplicate" };
    errorHandler(err, {}, res, {});

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      error: ["Duplicate field value entered"],
    });
  });

  it("should handle validation error", () => {
    const err = {
      name: "ValidationError",
      errors: { field: { message: "Invalid input" } },
    };
    errorHandler(err, {}, res, {});

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      error: ["Invalid input"],
    });
  });

  it("should handle general error", () => {
    const err = new Error("Something broke");
    errorHandler(err, {}, res, {});

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      error: ["Something broke"],
    });
  });
});
