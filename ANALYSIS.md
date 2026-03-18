# Actual Budget REST API - Comprehensive Analysis

## Overview

This document provides a detailed analysis of the Actual Budget REST API repository, including architecture, features, services, and recommendations for future development.

## Executive Summary

The repository implements a Node.js REST API that integrates with Actual Budget (a personal finance management application) via its official SDK. The primary function is to create transactions programmatically through a simple POST endpoint, with additional features for tax calculation and unique ID generation.

## Repository Structure

```
/app
├── index.js          # Main Express server
├── transaction.js    # Transaction logic and API integration
├── taxes.js          # Tax calculation engine
├── utils.js          # Utility functions (date formatting)
├── package.json      # Dependencies and scripts
├── taxes.yml         # Tax configuration
├── Dockerfile        # Container configuration
└── README.md         # User documentation
```

## Core Features

### 1. Transaction Creation Endpoint

**Endpoint**: `POST /`

**Functionality**:
- Creates transactions in Actual Budget automatically
- Accepts JSON body with:
  - `accountId`: Target account ID
  - `amount`: Transaction amount
  - `payee`: Payee name
  - `notes`: Transaction notes (auto-prefixed with timestamp)
- Optional: `uniqueId` for tracking

**Request Example**:
```json
{
  "accountId": "123",
  "amount": "100",
  "payee": "Amazon",
  "notes": "Purchase",
  "uniqueId": "order-12345"
}
```

### 2. Automatic Tax Calculation

**Mechanism**:
- Uses configurable tax rules defined in `taxes.yml`
- Leverages `mathjs` for expression evaluation
- Supports per-account tax rates with custom formulas

**Tax Configuration Example**:
```yaml
accounts:
  "123":
    tax: 0.1
  "456":
    tax: "amount * 0.05"
```

### 3. Unique ID Generation

- Optional feature to assign custom IDs to transactions
- Helps with tracking and reconciliation
- Currently has implementation issues

### 4. Docker Containerization

**Image**: Node.js 23.11.1-alpine

**Configuration**:
- Exposed port: 3000
- Working directory: `/app`
- Volume mounts for configuration files
- Non-root user for security

## Technical Stack

### Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| @actual-app/api | 25.12.0 | Actual Budget SDK integration |
| express | 4.21.2 | REST API framework |
| mathjs | 14.5.0 | Mathematical expression evaluation |
| js-yaml | 4.1.0 | YAML configuration parsing |

### Environment Variables

| Variable | Purpose | Required |
|----------|---------|----------|
| SERVER_URL | Actual Budget API URL | Yes |
| BUDGET_ID | Target budget/workspace ID | Yes |
| SERVER_PASSWORD | API authentication password | Yes |
| GENERATE_UNIC_ID | Enable unique ID generation | Optional |

## Architecture

### Request Flow

```
┌─────────────────┐
│   Client        │
│   (HTTP)        │
└────────┬────────┘
         │ POST /
         ▼
┌─────────────────┐
│   Express       │
│   Server        │
└────────┬────────┘
         │ validate & parse
         ▼
┌─────────────────┐
│  Transaction.js │
│  (Core Logic)   │
└────────┬────────┘
         │ calculate taxes
         │ create transaction
         ▼
┌─────────────────┐
│  Taxes.js       │
│  (Tax Engine)   │
└────────┬────────┘
         │ evaluate expressions
         ▼
┌─────────────────┐
│  Utils.js       │
│  (Date Format)  │
└────────┬────────┘
         │ format dates
         ▼
┌─────────────────┐
│  @actual-app    │
│  /api SDK       │
└────────┬────────┘
         │ POST /transactions
         ▼
┌─────────────────┐
│  Actual Budget  │
│  API Server     │
└─────────────────┘
```

### Module Interactions

1. **index.js**: Entry point, request handling, error management
2. **transaction.js**: 
   - Validates input data
   - Formats transaction objects
   - Integrates with Actual Budget API
   - Handles tax calculations
   - Manages response/error formatting
3. **taxes.js**:
   - Parses YAML configuration
   - Evaluates tax expressions
   - Calculates tax amounts per account
4. **utils.js**:
   - Formats dates for Actual Budget API
   - Provides helper utilities

## Tax System Analysis

### Configuration Format

The `taxes.yml` file defines tax rules per account:

```yaml
# Account ID -> Tax rules
accounts:
  "ACC_ID_1":
    tax: 0.1                    # Fixed rate
    notes: "Standard rate"
  
  "ACC_ID_2":
    tax: "amount * 0.05"        # Expression-based
    notes: "5% of amount"
  
  "ACC_ID_3":
    tax: "if amount > 1000 then 0.15 else 0.1"  # Conditional
    notes: "Tiered rate"
```

### Expression Capabilities

Using `mathjs`, the system supports:
- Basic arithmetic: `+`, `-`, `*, /`, `**`
- Variables: `amount`, `accountId`
- Functions: `round()`, `floor()`, `ceil()`
- Conditionals: `if-then-else`
- Comparisons: `>`, `<`, `>=`, `<=`, `==`

### Tax Calculation Flow

```
1. Parse taxes.yml → taxes object
2. For each transaction:
   a. Get account ID from request
   b. Retrieve tax rule for account
   c. Evaluate tax expression with amount
   d. Add tax amount to transaction
3. Return transaction with tax included
```

## Known Issues & Limitations

### Critical Issues

1. **Error Handling**: POST errors can crash the container
   - Impact: Service unavailability after failed requests
   - Solution: Implement proper try-catch blocks, health checks, and graceful degradation

2. **Unique ID Generation**: Feature not working as expected
   - Impact: Cannot track transactions properly
   - Solution: Debug and fix the ID generation logic

3. **Security**: No authentication or authorization
   - Impact: Anyone can create transactions
   - Solution: Add API key authentication, rate limiting, input validation

### Missing Features

1. **Income Transactions**: Only expense transactions supported
   - Impact: Cannot record income
   - Solution: Add income transaction type with different handling

2. **Transaction Updates**: Can only create, not modify
   - Impact: Cannot correct mistakes
   - Solution: Implement GET/PUT endpoints for existing transactions

3. **Transaction Deletion**: No way to remove transactions
   - Impact: Cannot delete erroneous entries
   - Solution: Add DELETE endpoint (with caution)

4. **Transaction List**: Cannot query existing transactions
   - Impact: No visibility into created transactions
   - Solution: Implement GET /transactions endpoint

5. **Pagination**: No limits on response size
   - Impact: Large transaction lists can break clients
   - Solution: Add pagination parameters

### Performance Considerations

1. **No Caching**: Each request calls Actual Budget API
   - Impact: Slow response times, API rate limits
   - Solution: Implement caching layer for common operations

2. **Synchronous Processing**: No async operations
   - Impact: Blocking requests
   - Solution: Use async/await throughout

3. **No Rate Limiting**: Unrestricted request volume
   - Impact: Potential abuse, API quota exhaustion
   - Solution: Implement rate limiting middleware

## Security Analysis

### Current State: Insecure

**Vulnerabilities**:
- No authentication mechanism
- No input validation/sanitization
- No request rate limiting
- No CORS configuration
- Environment variables exposed in documentation

### Recommended Security Measures

1. **Authentication**:
   - Add API key verification
   - Implement JWT tokens
   - Use OAuth if Available

2. **Input Validation**:
   - Validate all incoming data
   - Sanitize user input
   - Type checking for all fields

3. **Rate Limiting**:
   - Limit requests per IP
   - Implement token bucket algorithm
   - Add request throttling

4. **CORS**:
   - Configure allowed origins
   - Restrict cross-origin requests

5. **Environment Variables**:
   - Never commit to version control
   - Use `.env` files
   - Add to `.gitignore`

## Setup Instructions

### Prerequisites

- Node.js 20+ (or use Docker)
- Actual Budget account with API access
- Basic Linux/macOS knowledge

### Local Development

```bash
# Install dependencies
yarn install

# Set environment variables
export SERVER_URL="https://app.actualbudget.com"
export BUDGET_ID="your-budget-id"
export SERVER_PASSWORD="your-password"

# Run server
yarn dev
```

### Docker Deployment

```bash
# Build image
docker build -t actual-budget-api .

# Run container
docker run -p 3000:3000 \
  -e SERVER_URL="https://app.actualbudget.com" \
  -e BUDGET_ID="your-budget-id" \
  -e SERVER_PASSWORD="your-password" \
  actual-budget-api
```

### Testing

Use the included Bruno configuration or curl:

```bash
curl -X POST http://localhost:3000 \
  -H "Content-Type: application/json" \
  -d '{
    "accountId": "123",
    "amount": "100",
    "payee": "Test Store",
    "notes": "Test transaction"
  }'
```

## Configuration Examples

### taxes.yml - Various Scenarios

**Scenario 1: Simple Fixed Rate**
```yaml
accounts:
  "123":
    tax: 0.1
    notes: "10% flat rate"
```

**Scenario 2: Percentage of Amount**
```yaml
accounts:
  "456":
    tax: "amount * 0.08"
    notes: "8% of transaction value"
```

**Scenario 3: Tiered Pricing**
```yaml
accounts:
  "789":
    tax: "if amount > 500 then 0.15 else if amount > 100 then 0.1 else 0.05"
    notes: "Progressive tax rates"
```

**Scenario 4: Complex Formula**
```yaml
accounts:
  "999":
    tax: "round((amount + 10) * 0.12, 2)"
    notes: "12% on amount plus fixed fee"
```

## API Documentation

### Endpoints

#### POST / - Create Transaction

**Description**: Creates a new transaction in Actual Budget

**Request Body**:
```json
{
  "accountId": "string",
  "amount": "string",
  "payee": "string",
  "notes": "string",
  "uniqueId": "string"
}
```

**Response**:
```json
{
  "success": true,
  "transaction": {
    "id": "txn_123",
    "accountId": "123",
    "amount": "100",
    "payee": "Store",
    "notes": "API-created 2026-03-11 10:30:00 - Purchase",
    "tax": "10",
    "uniqueId": "order-12345"
  }
}
```

**Error Response**:
```json
{
  "success": false,
  "error": "Error message"
}
```

### Error Codes

| Code | Description |
|------|-------------|
| 400 | Bad request - invalid data |
| 401 | Unauthorized - missing/invalid credentials |
| 404 | Not found - account doesn't exist |
| 500 | Server error - internal issue |
| 503 | Service unavailable - Actual Budget down |

## Recommendations for Future Development

### High Priority

1. **Implement Authentication**
   - Add API key middleware
   - Validate credentials on every request
   - Log authentication attempts

2. **Fix Error Handling**
   - Wrap all API calls in try-catch
   - Add retry logic for transient errors
   - Implement health check endpoint

3. **Add Transaction Management**
   - GET /transactions - list all
   - PUT /transactions/:id - update
   - DELETE /transactions/:id - remove

4. **Implement Rate Limiting**
   - Prevent abuse
   - Protect against API quota exhaustion
   - Add request queuing

### Medium Priority

5. **Add Income Support**
   - Differentiate income vs expense
   - Separate handling logic
   - Different tax rules

6. **Add Transaction Categories**
   - Allow categorization
   - Store category data
   - Filter by category

7. **Add Date Range Queries**
   - Filter transactions by date
   - Pagination support
   - Sorting options

8. **Implement Caching**
   - Cache tax calculations
   - Cache account information
   - Reduce API calls

### Low Priority

9. **Add Webhook Support**
   - Receive events from Actual Budget
   - Trigger actions based on events
   - Real-time updates

10. **Add Dashboard**
    - Web interface for management
    - Transaction history view
    - Analytics and reporting

## Troubleshooting Guide

### Common Issues

**Issue**: Container crashes on POST request
- **Cause**: Unhandled exception in Actual Budget API
- **Solution**: Add try-catch blocks, implement error logging

**Issue**: Unique ID not appearing in transaction
- **Cause**: Feature not fully implemented
- **Solution**: Check transaction.js for uniqueId handling

**Issue**: Tax calculation returns incorrect value
- **Cause**: Invalid expression in taxes.yml
- **Solution**: Test expression in mathjs playground, validate syntax

**Issue**: 401 Unauthorized errors
- **Cause**: Environment variables not set correctly
- **Solution**: Verify SERVER_URL, BUDGET_ID, SERVER_PASSWORD

**Issue**: Transactions not appearing in Actual Budget
- **Cause**: API rate limit or network issue
- **Solution**: Check Actual Budget API status, add retry logic

### Debugging Tips

1. Enable verbose logging in development
2. Use Bruno for request/response inspection
3. Check Actual Budget API documentation for changes
4. Verify account IDs exist in Actual Budget
5. Test tax expressions independently

## Testing Strategy

### Unit Tests

- Test tax calculation functions
- Test date formatting
- Test input validation
- Test error handling

### Integration Tests

- Test full transaction flow
- Test with Actual Budget sandbox
- Test error scenarios

### Load Tests

- Test concurrent requests
- Test rate limiting
- Test memory usage

## Conclusion

This REST API provides a functional integration between a custom system and Actual Budget, enabling programmatic transaction creation with tax calculations. While the basic functionality works, significant improvements are needed in error handling, security, and feature completeness before production use.

The modular architecture allows for easy extension, and the use of official SDKs ensures compatibility with Actual Budget's API. With the recommended improvements, this could become a robust solution for automated budget management.

---

**Generated**: March 11, 2026
**Version**: 1.0.0
**Author**: opencode analysis