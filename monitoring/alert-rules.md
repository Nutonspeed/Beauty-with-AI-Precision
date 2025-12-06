# Alert Rules Configuration

## Critical Alerts (Immediate Response Required)
### Application Down
- **Condition**: `up{job="beauty-ai-precision"} == 0`
- **Severity**: Critical
- **Duration**: 5 minutes
- **Description**: Application is not responding
- **Action**: Auto-restart application, notify on-call engineer

### Database Connection Lost
- **Condition**: `pg_up == 0`
- **Severity**: Critical
- **Duration**: 2 minutes
- **Description**: Database is unreachable
- **Action**: Check database status, switch to read-only mode if needed

### Security Breach Detected
- **Condition**: `security_incidents_critical > 0`
- **Severity**: Critical
- **Duration**: Immediate
- **Description**: Critical security incident detected
- **Action**: Lock down system, isolate affected components, notify security team

### Payment System Failure
- **Condition**: `payment_processing_errors > 5`
- **Severity**: Critical
- **Duration**: 1 minute
- **Description**: Payment processing is failing
- **Action**: Pause transactions, notify finance team, switch to manual processing

## High Priority Alerts (Response within 1 hour)
### High Error Rate
- **Condition**: `rate(http_requests_total{status=~"5.."}[5m]) / rate(http_requests_total[5m]) > 0.05`
- **Severity**: High
- **Duration**: 5 minutes
- **Description**: Error rate exceeds 5%
- **Action**: Investigate root cause, rollback recent changes if needed

### Slow API Response Times
- **Condition**: `histogram_quantile(0.95, rate(http_request_duration_seconds_bucket{job="beauty-ai-precision"}[5m])) > 5`
- **Severity**: High
- **Duration**: 10 minutes
- **Description**: 95th percentile response time > 5 seconds
- **Action**: Check database performance, scale resources, optimize queries

### Memory Usage Critical
- **Condition**: `process_resident_memory_bytes / process_virtual_memory_max_bytes > 0.9`
- **Severity**: High
- **Duration**: 5 minutes
- **Description**: Memory usage exceeds 90%
- **Action**: Restart application, check for memory leaks, scale vertically

### AI Service Degradation
- **Condition**: `ai_processing_time > 10`
- **Severity**: High
- **Duration**: 5 minutes
- **Description**: AI processing time exceeds 10 seconds
- **Action**: Check AI service health, switch to backup model if available

## Medium Priority Alerts (Response within 4 hours)
### Disk Space Low
- **Condition**: `(node_filesystem_avail_bytes / node_filesystem_size_bytes) < 0.1`
- **Severity**: Medium
- **Duration**: 30 minutes
- **Description**: Disk space below 10%
- **Action**: Clean up old logs, archive data, add storage capacity

### Certificate Expiring Soon
- **Condition**: `ssl_certificate_expiry < 7*24*3600`
- **Severity**: Medium
- **Duration**: 1 hour
- **Description**: SSL certificate expires in less than 7 days
- **Action**: Renew certificate, update configurations

### Queue Backlog High
- **Condition**: `queue_length > 1000`
- **Severity**: Medium
- **Duration**: 15 minutes
- **Description**: Processing queue has >1000 items
- **Action**: Scale processing workers, check for processing bottlenecks

### Third-party API Failures
- **Condition**: `external_api_errors > 10`
- **Severity**: Medium
- **Duration**: 10 minutes
- **Description**: External API calls are failing
- **Action**: Check API status, implement fallback, contact provider

## Low Priority Alerts (Response within 24 hours)
### Log Storage Full
- **Condition**: `log_storage_usage > 0.8`
- **Severity**: Low
- **Duration**: 2 hours
- **Description**: Log storage usage > 80%
- **Action**: Rotate logs, compress old logs, archive to long-term storage

### Deprecated API Usage
- **Condition**: `deprecated_api_calls > 0`
- **Severity**: Low
- **Duration**: 6 hours
- **Description**: Deprecated API endpoints are being used
- **Action**: Update client applications, plan API migration

### Backup Failures
- **Condition**: `backup_status == "failed"`
- **Severity**: Low
- **Duration**: 1 hour
- **Description**: Automated backup has failed
- **Action**: Run manual backup, fix backup script, verify backup integrity

## Business Alerts (Response based on impact)
### Low Appointment Bookings
- **Condition**: `appointment_bookings_per_hour < 2`
- **Severity**: Info/Medium
- **Duration**: 2 hours
- **Description**: Appointment booking rate below threshold
- **Action**: Marketing campaign, check website functionality

### High Cancellation Rate
- **Condition**: `appointment_cancellations / appointment_bookings > 0.15`
- **Severity**: Medium
- **Duration**: 1 hour
- **Description**: Cancellation rate exceeds 15%
- **Action**: Customer service follow-up, service quality review

### Revenue Drop
- **Condition**: `revenue_change_percent < -0.2`
- **Severity**: High
- **Duration**: 4 hours
- **Description**: Revenue decreased by more than 20%
- **Action**: Financial review, marketing analysis, customer retention focus

### AI Analysis Accuracy Drop
- **Condition**: `ai_accuracy_score < 0.85`
- **Severity**: Medium
- **Duration**: 2 hours
- **Description**: AI analysis accuracy below 85%
- **Action**: Retrain models, check data quality, implement fallback logic

## Alert Configuration Guidelines
1. **Severity Levels**: Critical > High > Medium > Low > Info
2. **Response Times**: Based on potential business impact
3. **Escalation**: Automatic escalation if not acknowledged
4. **Suppression**: Smart alert suppression to avoid noise
5. **Testing**: Regular alert testing to ensure functionality
6. **Documentation**: All alerts must have clear response procedures
