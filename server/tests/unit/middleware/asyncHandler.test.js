const asyncHandler = require("../../../utils/asyncHandler");

describe("asyncHandler middleware", () => {
  it("should call the async function and resolve", async () => {
    const req = {};
    const res = {};
    const next = jest.fn();

    const fn = jest.fn().mockResolvedValue("success");
    await asyncHandler(fn)(req, res, next);

    expect(fn).toHaveBeenCalledWith(req, res, next);
    expect(next).not.toHaveBeenCalled();
  });

  it("should catch errors and call next with error", async () => {
    const req = {};
    const res = {};
    const next = jest.fn();

    const error = new Error("Test error");
    const fn = jest.fn().mockRejectedValue(error);

    await asyncHandler(fn)(req, res, next);

    expect(next).toHaveBeenCalledWith(error);
  });
});
