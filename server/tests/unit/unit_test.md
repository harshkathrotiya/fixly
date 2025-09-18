# Unit Tests Notes & Changes

## Middleware: Error Handler

- **Changes Made:**  
  - `errorHandler` now returns JSON for all errors consistently.  
  - Errors are formatted as:
    ```json
    { "success": false, "error": "<error message>" }
    ```
  - Specific handling:
    - **CastError** → 404, message: `"Resource not found"`
    - **Duplicate Key (11000)** → 400, message: `"Duplicate field value entered"`
    - **ValidationError** → 400, concatenates all field messages
    - **General Errors** → 500, uses `err.message` or default `"Something went wrong"`

- **Observations from Tests:**
  - Previous tests expected arrays for validation errors; changed to string to match current middleware.
  - All console errors during tests are expected logs and show proper error type and message.
  - JSON output now matches client/API response expectations.


## Middleware: Async Handler

- **Changes Made:**
  - `asyncHandler` wraps async functions and catches errors to call `next(err)`.
  - Errors logged with `[ASYNC ERROR] <message>` for debugging.

- **Observations from Tests:**
  - Test confirms async errors propagate correctly.
  - `next(err)` is called as expected when promise rejects.



## Utility: Send Email

- **Changes Made:**
  - `sendEmail` function tested for both text and HTML email content.
  - Logs show successful sending during tests (`[EMAIL SENT] <subject> → <recipient>`).

- **Observations from Tests:**
  - Tests pass with mock parameters; no real emails sent.
  - Confirms correct mail options are set for plain text and HTML emails.



## General Notes

- All tests pass now with the updated middleware.
- Errors are consistently returned in JSON format for client/API.
- Console logs are for development/debugging purposes.
- Keep tests updated if middleware formatting changes in the future.
# Fixly Server Unit Testing Documentation

## Overview

This document summarizes the unit tests for the Fixly server project, including middleware and utility functions. All tests are written using Jest. The tests cover error handling, async handling, and email utilities to ensure API reliability.



## Test Suites & Results

### 1. Middleware: Error Handler (`tests/unit/middleware/errorHandler.test.js`)

**Test Cases:**
- Handle `CastError`
- Handle duplicate key error (`11000`)
- Handle `ValidationError`
- Handle general errors

**Console Logs During Tests:**

[ERROR] CastError: Invalid ID  
[ERROR] Error: Duplicate  
[ERROR] ValidationError: Something went wrong  
[ERROR] Error: Something broke  

**Results:**
- ✅ All test cases passed
- Errors are returned in JSON format:
```json
{
  "success": false,
  "error": "<error message>"
}
```

**Notes:**
- Validation errors are returned as a string.
- Middleware ensures consistent JSON error responses for API clients.
- Development logging is printed for all errors.

### 2. Middleware: Async Handler (`tests/unit/middleware/asyncHandler.test.js`)

**Test Cases:**
- Catch async errors and call `next(err)`

**Console Logs During Tests:**

[ASYNC ERROR] Test error

**Results:**
- ✅ All test cases passed

**Notes:**
- Async errors propagate correctly.
- `next(err)` is invoked for rejected promises as expected.

### 3. Utility: Send Email (`tests/unit/utils/sendEmail.test.js`)

**Test Cases:**
- Send email with subject and HTML content

**Console Logs During Tests:**

[EMAIL SENT] Test Subject → test@example.com  
[EMAIL SENT] Test HTML → test@example.com  

**Results:**
- ✅ All test cases passed

**Notes:**
- Uses mock parameters; no real emails sent.
- Confirms correct email options for text and HTML content.

## Summary

**Total Test Suites:** 3  
**Total Test Cases:** 8  
**Passed:** 8  
**Failed:** 0  
**Snapshots:** 0  

**General Notes:**
- All errors are returned in consistent JSON format for both API and client.
- Console logs provide development/debugging information.
- Test cases cover all key error scenarios for middleware and utility functions.
- Ensure tests are updated if middleware logic or output format changes.

## Recommendations

- Maintain test coverage for all middleware and utility functions.
- Add more test cases for edge cases and unusual errors.
- Include integration tests for API endpoints in future iterations.