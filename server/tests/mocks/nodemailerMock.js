const sendMailMock = jest.fn().mockResolvedValue({
  accepted: ["test@example.com"],
  response: "250 Message accepted",
});

module.exports = {
  createTransport: jest.fn(() => ({
    sendMail: sendMailMock,
  })),
  sendMailMock,
};
