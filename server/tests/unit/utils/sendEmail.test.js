jest.mock("nodemailer", () => require("../../mocks/nodemailerMock"));
const sendEmail = require("../../../utils/sendEmail");
const { sendMailMock } = require("../../mocks/nodemailerMock");

describe("sendEmail utility", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should send email with text only", async () => {
    await sendEmail({
      email: "test@example.com",
      subject: "Test Subject",
      message: "Hello World",
    });

    expect(sendMailMock).toHaveBeenCalledWith(
      expect.objectContaining({
        to: "test@example.com",
        subject: "Test Subject",
        text: "Hello World",
      })
    );
  });

  it("should send email with html when provided", async () => {
    await sendEmail({
      email: "test@example.com",
      subject: "Test HTML",
      message: "Plain text",
      html: "<p>Hello</p>",
    });

    expect(sendMailMock).toHaveBeenCalledWith(
      expect.objectContaining({
        html: "<p>Hello</p>",
      })
    );
  });
});
