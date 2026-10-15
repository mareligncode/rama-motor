### Collection 1: `users`

Common account information. Do not store role-specific driver details here.

- `_id`: ObjectId
- `fullName`: string
- `nationalIDdetial`:{
- fannumer
- fin number
- image{
front
- back}
- `fanNumberVerifiedAt`: date, optional
- `phoneCountryCode`: string — default `+251`
- `phoneNumber`: string
- `normalizedPhone`: string — unique normalized phone
- `phoneVerifiedAt`: date, optional
- `profileImageUrl`: string, optional
- `roles`: array of enum — `sender`, `driver`, `vehicle_owner`, `staff`
- `accountStatus`: enum — `pending`, `active`, `suspended`, `deactivated`
- `suspensionReason`: string, optional
- `lastLoginAt`: date, optional
- `createdAt`: date
- `updatedAt`: date
- `deletedAt`: date, optional

Indexes

- Unique `normalizedPhone`
- `accountStatus`
- `roles`
- `createdAt`

### Collection 2: `otps`

Used for login, phone verification, pickup verification, and recipient handover verification. Store OTP hashes, not plaintext codes.

- `_id`: ObjectId
- `userId`: ObjectId, optional reference to `users`
- `deliveryId`: ObjectId, optional reference to `deliveries`
- `phoneNumber`: string
- `purpose`: enum — `login`, `phone_verification`, `password_reset`, `delivery_pickup`, `delivery_dropoff`
- `codeHash`: string
- `expiresAt`: date
- `attemptCount`: number
- `maxAttempts`: number
- `status`: enum — `pending`, `verified`, `expired`, `locked`, `consumed`
- `verifiedAt`: date, optional
- `consumedAt`: date, optional
- `createdAt`: date

Indexes

- `expiresAt` — TTL for temporary OTP records, subject to MongoDB's asynchronous TTL cleanup
- `phoneNumber + purpose + status`
- `deliveryId + purpose`

OTP verification must check expiration and attempt limits directly; do not depend on TTL deletion for security.

### Collection 3: `roles`

- `_id`: ObjectId
- `name`: string — unique
- `description`: string
- `permissions`: array of strings
- `status`: enum — `active`, `inactive`
- `createdAt`: date
- `updatedAt`: date

### Collection 4: `staffs`

- `_id`: ObjectId
- `userId`: ObjectId, reference to `users`
- `roleId`: ObjectId, reference to `roles`
- `staffCode`: string
- `department`: enum — `operations`, `finance`, `accounting`, `audit`, `legal`, `customer_support`, `security`, `management`
- `assignedBy`: ObjectId, reference to `users`
- `status`: enum — `active`, `suspended`, `inactive`
- `createdAt`: date
- `updatedAt`: date
- `deletedAt`: date, optional

Indexes: unique `userId` if each user has one staff profile; unique `staffCode`; `roleId + status`.

## 3. Drivers and motorcycle management

### Collection 5: `drivers`

- `_id`: ObjectId
- `userId`: ObjectId, reference to `users`
- `dateOfBirth`: date, if required for eligibility
- `licenseNumber`: string
- `licenseType`: string
- `licenseIssueDate`: date
- `licenseExpiryDate`: date
- `verificationStatus`: enum — `pending`, `verified`, `rejected`, `expired`
- `approvalStatus`: enum — `pending`, `approved`, `rejected`
- `onlineStatus`: boolean
- `deliveryStatus`: enum — `offline`, `available`, `offered`, `delivering`, `suspended`
- `currentVehicleId`: ObjectId, optional reference to `vehicles`
- `averageRating`: number, default `0`
- `totalDeliveries`: number, default `0`
- `completedDeliveries`: number, default `0`
- `rejectionReason`: string, optional
- `approvedBy`: ObjectId, optional reference to `staffs`
- `approvedAt`: date, optional
- `createdAt`: date
- `updatedAt`: date
- `deletedAt`: date, optional
- `priorityScore`: number — default `0`
- `priorityLevel`: enum — `low`, `normal`, `high`, `preferred`
- `priorityStatus`: enum — `active`, `inactive`, `under_review`
- `priorityFactors`: object
    - `completedDeliveries`: number
    - `averageRating`: number
    - `acceptanceRate`: number
    - `completionRate`: number
    - `onTimeDeliveryRate`: number
    - `cancellationRate`: number
    - `incidentRate`: number
    - `accountAgeDays`: number
- `priorityUpdatedAt`: date
- `priorityUpdatedBy`: ObjectId, optional reference to `staffs`
- `priorityReason`: string, optional

Indexes

- `priorityStatus + priorityScore`
- `priorityLevel + priorityScore`
- `priorityUpdatedAt`

Indexes

- Unique `userId`
- Unique normalized `licenseNumber` where present
- `approvalStatus + deliveryStatus`
- `licenseExpiryDate`

Do not duplicate the wallet balance here. Retrieve the authoritative balance from the wallet system.

### Collection 6: `driver_documents`

- `_id`: ObjectId
- `driverId`: ObjectId, reference to `drivers`
- `documentType`: enum — `national_id`, `driving_license`, `profile_photo`, `background_check`, `other`
- `documentNumber`: string, optional and protected
- `fileUrl`: string
- `checksum`: string
- `issueDate`: date, optional
- `expiryDate`: date, optional
- `verificationStatus`: enum — `pending`, `verified`, `rejected`, `expired`
- `verifiedBy`: ObjectId, optional reference to `staffs`
- `verifiedAt`: date, optional
- `rejectionReason`: string, optional
- `createdAt`: date
- `updatedAt`: date

Indexes: `driverId + documentType`; `verificationStatus + expiryDate`.

### Collection 7: `vehicles`

- `_id`: ObjectId
- `ownerUserId`: ObjectId, reference to `users`
- `plateNumber`: string
- `registrationNumber`: string
- `vehicleCategory`: enum — `motorcycle`, `bajaj`, `other`
- `powerType`: enum — `electric`, `fuel`, `hybrid`
- `brand`: string
- `model`: string
- `color`: string
- `manufacturingYear`: number
- `registrationExpiryDate`: date
- `insuranceNumber`: string, optional
- `insuranceExpiryDate`: date, optional
- `maxWeightKg`: number
- `maxDimensionsCm`: object
    - `length`: number
    - `width`: number
    - `height`: number
- `hasDeliveryBox`: boolean
- `hasInsulatedBox`: boolean
- `serviceType`: enum — `delivery`, `both`
- `approvalStatus`: enum — `pending`, `approved`, `rejected`
- `status`: enum — `active`, `inactive`, `suspended`, `maintenance`
- `approvedBy`: ObjectId, optional reference to `staffs`
- `approvedAt`: date, optional
- `createdAt`: date
- `updatedAt`: date
- `deletedAt`: date, optional

Indexes

- Unique normalized `plateNumber`
- Unique `registrationNumber`
- `ownerUserId + status`
- `approvalStatus + status`
- `powerType + vehicleCategory`

Only enforce uniqueness for optional document numbers when present and valid.

### Collection 8: `vehicle_documents`

- `_id`: ObjectId
- `vehicleId`: ObjectId, reference to `vehicles`
- `documentType`: enum — `registration`, `insurance`, `inspection`, `ownership`, `other`
- `documentNumber`: string, optional
- `fileUrl`: string
- `checksum`: string
- `issueDate`: date, optional
- `expiryDate`: date, optional
- `verificationStatus`: enum — `pending`, `verified`, `rejected`, `expired`
- `verifiedBy`: ObjectId, optional reference to `staffs`
- `verifiedAt`: date, optional
- `rejectionReason`: string, optional
- `createdAt`: date
- `updatedAt`: date

### Collection 9: `vehicle_rental_agreements`

Required only when a driver rents a motorcycle rather than using an authorized owner-operated or personally owned vehicle.

- `_id`: ObjectId
- `vehicleId`: ObjectId, reference to `vehicles`
- `ownerUserId`: ObjectId, reference to `users`
- `driverId`: ObjectId, reference to `drivers`
- `agreementNumber`: string
- `agreementDocumentUrl`: string
- `startDate`: date
- `endDate`: date
- `rentalFee`: Decimal128
- `paymentPeriod`: enum — `daily`, `weekly`, `monthly`, `other`
- `currency`: string — `ETB`
- `paymentStatus`: enum — `pending`, `paid`, `overdue`, `disputed`
- `ownerApprovalStatus`: enum — `pending`, `approved`, `rejected`, `revoked`
- `verificationStatus`: enum — `pending`, `verified`, `rejected`, `expired`
- `verifiedBy`: ObjectId, optional reference to `staffs`
- `verifiedAt`: date, optional
- `rejectionReason`: string, optional
- `createdAt`: date
- `updatedAt`: date

Indexes: `vehicleId + startDate + endDate`; `driverId + verificationStatus`; unique `agreementNumber`.

The backend must reject overlapping active vehicle assignments and check agreement validity at assignment time and while the driver is working.

### Collection 10: `vehicle_assignments`

- `_id`: ObjectId
- `vehicleId`: ObjectId, reference to `vehicles`
- `driverId`: ObjectId, reference to `drivers`
- `rentalAgreementId`: ObjectId, optional reference to `vehicle_rental_agreements`
- `assignmentType`: enum — `owner_operated`, `owned`, `rented`, `authorized`
- `assignedFrom`: date
- `assignedTo`: date, optional
- `assignedBy`: ObjectId, reference to `staffs`
- `status`: enum — `active`, `ended`, `revoked`
- `notes`: string, optional
- `createdAt`: date
- `updatedAt`: date

Indexes: `vehicleId + status`; `driverId + status`; unique partial active assignment constraints on `vehicleId` and, if your business rules require it, `driverId`.

MongoDB partial indexes and transaction-level checks should enforce the actual assignment policy; an ordinary compound index alone does not prevent every overlapping date range.

## 4. Sender addresses, delivery orders, and packages

### Collection 11: `saved_addresses`

- `_id`: ObjectId
- `userId`: ObjectId, reference to `users`
- `label`: string — home / office / warehouse / other
- `contactName`: string
- `contactPhone`: string
- `addressLine`: string
- `city`: string
- `subCity`: string, optional
- `woreda`: string, optional
- `buildingName`: string, optional
- `landmark`: string, optional
- `location`: GeoJSON Point
- `isDefault`: boolean
- `createdAt`: date
- `updatedAt`: date

Indexes: `userId`; `2dsphere` on `location`.

### Collection 12: `delivery_orders`

The sender's original request. This is separate from the driver assignment and execution record.

- `_id`: ObjectId
- `orderNumber`: string — unique human-readable reference
- `senderId`: ObjectId, reference to `users`
- `recipientUserId`: ObjectId, optional reference to `users`
- `recipientName`: string
- `recipientPhoneCountryCode`: string
- `recipientPhoneNumber`: string
- `recipientType`: enum — `individual`, `business`, `authorized_representative`
- `pickupAddress`: object
    - `contactName`: string
    - `contactPhone`: string
    - `addressLine`: string
    - `city`: string
    - `subCity`: string, optional
    - `woreda`: string, optional
    - `landmark`: string, optional
    - `location`: GeoJSON Point
- `deliveryAddress`: object
    - `contactName`: string
    - `contactPhone`: string
    - `addressLine`: string
    - `city`: string
    - `subCity`: string, optional
    - `woreda`: string, optional
    - `landmark`: string, optional
    - `location`: GeoJSON Point
- `deliveryInstructions`: string, optional
- `packageCount`: number
- `totalWeightKg`: number
- `totalDeclaredValue`: Decimal128
- `currency`: string — `ETB`
- `serviceLevel`: enum — `standard`, `express`, `scheduled`
- `scheduledPickupAt`: date, optional
- `estimatedDeliveryAt`: date, optional
- `fareQuoteId`: ObjectId, optional reference to `fare_quotes`
- `quotedDeliveryFee`: Decimal128
- `finalDeliveryFee`: Decimal128, optional
- `paymentMethod`: enum — `cash`, `bank_transfer`, `mobile_money`, `wallet`, `cod`
- `paymentStatus`: enum — `pending`, `authorized`, `paid`, `failed`, `partially_refunded`, `refunded`
- `orderStatus`: enum — `draft`, `pending`, `searching_driver`, `assigned`, `in_progress`, `delivered`, `failed`, `cancelled`, `returning`, `returned`
- `is canclled`
- `canclled by`
- `cancellationReason`
- `cancellationReason`: string, optional
- `createdBy`: ObjectId, reference to `users`
- `updatedBy`: ObjectId, optional reference to `users`
- `version`: number, default `0`
- `idempotencyKey`: string
- `createdAt`: date
- `updatedAt`: date
- `deletedAt`: date, optional

Indexes

- Unique `orderNumber`
- Unique compound `senderId + idempotencyKey` for applicable creation requests
- `senderId + orderStatus + createdAt`
- `orderStatus + scheduledPickupAt`
- `pickupAddress.location` — `2dsphere`
- `deliveryAddress.location` — `2dsphere`

Keep a snapshot of the recipient and address on the order so that later changes to a saved address do not silently alter an existing delivery.

### Collection 13: `delivery_items`

One order may contain several packages or item types.

- `_id`: ObjectId
- `deliveryOrderId`: ObjectId, reference to `delivery_orders`
- `itemName`: string
- `category`: string
- `description`: string, optional
- `quantity`: number
- `weightKg`: number
- `dimensionsCm`: object
    - `length`: number
    - `width`: number
    - `height`: number
- `declaredValue`: Decimal128
- `currency`: string — `ETB`
- `handlingInstructions`: string, optional
- `itemPhotoUrls`: array of strings
- `packagingConditionAtPickup`: enum — `good`, `damaged`, `opened`, `other`
- `prohibitedGoodsCheck`: enum — `pending`, `cleared`, `rejected`
- `checkedBy`: ObjectId, optional reference to `users`
- `checkedAt`: date, optional
- `createdAt`: date
- `updatedAt`: date

Indexes: `deliveryOrderId`; `category`; `prohibitedGoodsCheck`.

Do not rely on a category string alone to approve dangerous or restricted items. Implement an enforceable prohibited-items policy and review workflow.

### Collection 14: `delivery_recipients`

For recipient authorization, OTP handover verification, and alternative recipients.

- `_id`: ObjectId
- `deliveryOrderId`: ObjectId, reference to `delivery_orders`
- `recipientUserId`: ObjectId, optional reference to `users`
- `recipientName`: string
- `recipientPhone`: string
- `recipientType`: enum — `primary`, `authorized_alternative`
- `relationshipToRecipient`: string, optional
- `authorizationStatus`: enum — `pending`, `authorized`, `revoked`
- `verificationMethod`: enum — `otp`, `signature`, `manual_review`
- `verificationStatus`: enum — `pending`, `verified`, `failed`
- `verifiedAt`: date, optional
- `authorizedBy`: ObjectId, optional reference to `users`
- `createdAt`: date
- `updatedAt`: date

Indexes: `deliveryOrderId + authorizationStatus`; `recipientPhone`.

Do not treat the presence of a phone number as proof of identity. Verification must be tied to the specific delivery and handover attempt

## 5. Matching and delivery execution

### Collection 15: `delivery_offers`

- `_id`: ObjectId
- `deliveryOrderId`: ObjectId, reference to `delivery_orders`
- `driverId`: ObjectId, reference to `drivers`
- `vehicleId`: ObjectId, reference to `vehicles`
- `offerRound`: number
- `offeredAt`: date
- `expiresAt`: date
- `responseStatus`: enum — `pending`, `accepted`, `declined`, `expired`, `withdrawn`
- `responseAt`: date, optional
- `distanceToPickupKm`: number
- `estimatedArrivalMinutes`: number, optional
- `createdAt`: date
- `updatedAt`: date

Indexes

- Unique `deliveryOrderId + driverId + offerRound`
- `driverId + responseStatus + expiresAt`
- `deliveryOrderId + responseStatus`

Keep expired offers for auditing. Use a background job to mark them expired instead of relying on TTL to remove the records.

### Collection 16: `deliveries`

The execution record for an assigned driver and vehicle.

- `_id`: ObjectId
- `deliveryOrderId`: ObjectId, reference to `delivery_orders`
- `driverId`: ObjectId, reference to `drivers`
- `vehicleId`: ObjectId, reference to `vehicles`
- `vehicleAssignmentId`: ObjectId, reference to `vehicle_assignments`
- `deliveryStatus`: enum — `assigned`, `en_route_to_pickup`, `arrived_at_pickup canclled`, `picked_up`, `in_transit`, `arrived_at_dropoff`, `delivered`, `failed`, `returning`, `returned`, `cancelled`
- `pickupAddressSnapshot`: object
- `pickupLocation`: GeoJSON Point
- `deliveryAddressSnapshot`: object
- `deliveryLocation`: GeoJSON Point
- `distanceKm`: number, optional
- `estimatedDurationMin`: number, optional
- `actualDurationMin`: number, optional
- `deliveryFee`: Decimal128
- `discountAmount`: Decimal128
- `totalAmount`: Decimal128
- `currency`: string — `ETB`
- `paymentMethod`: string
- `paymentStatus`: enum — `pending`, `paid`, `failed`, `partially_refunded`, `refunded`
- `assignedAt`: date
- `arrivedAtPickup`: date, optional
- `pickedUpAt`: date, optional
- `arrivedAtDropoff`: date, optional
- `deliveredAt`: date, optional
- `failedAt`: date, optional
- `returnedAt`: date, optional
- `cancelledAt`: date, optional
- `failureReason`: string, optional
- `cancellationReason`: string, optional
- `cancelledBy`
- `version`: number, default `0`
- `createdAt`: date
- `updatedAt`: date

Indexes

- `deliveryOrderId`
- `driverId + deliveryStatus`
- `vehicleId + deliveryStatus`
- `deliveryStatus + assignedAt`
- `pickupLocation` — `2dsphere`
- `deliveryLocation` — `2dsphere`

Use a transaction to atomically reserve the driver, vehicle, order, and accepted offer. Enforce your rule for whether one order can have multiple delivery attempts.

### Collection 17: `delivery_status_history`

- `_id`: ObjectId
- `deliveryId`: ObjectId, reference to `deliveries`
- `deliveryOrderId`: ObjectId, reference to `delivery_orders`
- `previousStatus`: string, optional
- `newStatus`: string
- `changedBy`: ObjectId, reference to `users`
- `actorRole`: enum — `sender`, `driver`, `staff`, `system`
- `reasonCode`: string, optional
- `notes`: string, optional
- `location`: GeoJSON Point, optional
- `createdAt`: date

Indexes: `deliveryId + createdAt`; `deliveryOrderId + createdAt`; `newStatus + createdAt`.

### Collection 18: `delivery_tracking`

High-volume GPS records for live tracking and later investigation.

- `_id`: ObjectId
- `deliveryId`: ObjectId, optional reference to `deliveries`
- `driverId`: ObjectId, reference to `drivers`
- `vehicleId`: ObjectId, reference to `vehicles`
- `location`: GeoJSON Point
- `heading`: number, optional
- `speedKmh`: number, optional
- `accuracyMeters`: number, optional
- `recordedAt`: date
- `receivedAt`: date
- `source`: enum — `gps`, `network`, `other`

Indexes

- `2dsphere` on `location`
- `driverId + recordedAt`
- `deliveryId + recordedAt`

Use a separate current-location cache in Redis for live matching. Apply a documented retention policy to historical GPS records

## Collection 19: `notifications`

- `_id`: ObjectId
- `recipientUserId`: ObjectId, reference to `users`
- `recipientRole`: enum — `sender`, `recipient`, `driver`, `vehicle_owner`, `staff`, `admin`
- `senderUserId`: ObjectId, optional reference to `users`
- `notificationType`: enum — `auth`, `payment`, `warning`, `delivery`,  `other`
- `title`: string
- `message`: string
- `data`: object, optional
    - `deliveryOrderId`: ObjectId, optional
    - `deliveryId`: ObjectId, optional
    - `driverId`: ObjectId, optional
    - `vehicleId`: ObjectId, optional
    - `transactionId`: ObjectId, optional
    - `incidentId`: ObjectId, optional
    - `screen`: string, optional — destination screen in the app
- `priority`: enum — `low`, `normal`, `high`, `urgent`
- `channels`: array of enum — `in_app`, `push`, `sms`, `email`
- `deliveryStatus`: enum — `pending`, `processing`, `sent`, `partially_sent`, `failed`, `cancelled`
- `readAt`: date, optional
- `isRead`: boolean, default `false`
- `expiresAt`: date, optional
- `createdAt`: date
- `updatedAt`: date

### Collection 20: `delivery_proofs`

- `_id`: ObjectId
- `deliveryId`: ObjectId, reference to `deliveries`
- `deliveryOrderId`: ObjectId, reference to `delivery_orders`
- `proofType`: enum — `pickup`, `dropoff`, `failed_attempt`, `return`
- `verificationMethod`: enum — `otp`, `signature`, `photo`, `authorized_representative`, `manual_review`
- `otpVerificationId`: ObjectId, optional reference to the verification record
- `recipientNameConfirmed`: string, optional
- `recipientUserId`: ObjectId, optional reference to `users`
- `recipientIdNumber`: string, optional and restricted
- `signatureUrl`: string, optional
- `photoUrls`: array of strings
- `packageCondition`: enum — `good`, `damaged`, `opened`, `other`
- `location`: GeoJSON Point, optional
- `deliveredBy`: ObjectId, reference to `drivers`
- `verifiedBy`: ObjectId, optional reference to `staffs`
- `notes`: string, optional
- `recordedAt`: date
- `createdAt`: date

Indexes: `deliveryId + proofType`; `deliveryOrderId`; `deliveredBy + recordedAt`.

Allow multiple proofs when a delivery has multiple packages or attempts. Enforce the required proof method before the backend permits a transition to `delivered`.

### Collection 21: `incidents`

- `_id`: ObjectId
- `reporterUserId`: ObjectId, reference to `users`
- `deliveryId`: ObjectId, optional reference to `deliveries`
- `deliveryOrderId`: ObjectId, reference to `delivery_orders`
- `driverId`: ObjectId, optional reference to `drivers`
- `incidentType`: enum — `damaged_package`, `lost_package`, `wrong_delivery`, `recipient_unavailable`, `theft`, `tampering`, `accident`, `harassment`, `fraud`, `other`
- `severity`: enum — `low`, `medium`, `high`, `critical`
- `description`: string
- `location`: GeoJSON Point, optional
- `evidenceUrls`: array of strings
- `emergencyContact`: string, optional
- `incidentStatus`: enum — `open`, `investigating`, `resolved`, `closed`
- `assignedSupportStaffId`: ObjectId, optional reference to `staffs`
- `resolutionDetails`: string, optional
- `resolvedAt`: date, optional
- `createdAt`: date
- `updatedAt`: date

Indexes: `incidentStatus + severity + createdAt`; `deliveryId`; `deliveryOrderId`; `driverId`; `location` — `2dsphere`.

## 7. Pricing, zones, and promotions

### Collection 22: `fare_rules`

- `_id`: ObjectId
- `ruleName`: string
- `serviceType`: enum — `delivery`
- `vehicleCategory`: string
- `powerType`: enum — `electric`, `fuel`, `hybrid`
- `baseFee`: Decimal128
- `pricePerKm`: Decimal128
- `pricePerKg`: Decimal128
- `pricePerMinute`: Decimal128, optional
- `waitingFeePerMinute`: Decimal128
- `handlingFee`: Decimal128
- `minimumFee`: Decimal128
- `maximumFee`: Decimal128
- `cancellationFee`: Decimal128
- `returnFee`: Decimal128
- `codServiceFee`: Decimal128
- `serviceFeePercentage`: number
- `insuranceFeePercentage`: number, optional
- `maxWeightKg`: number
- `maxDistanceKm`: number
- `currency`: string — `ETB`
- `effectiveStartDate`: date
- `effectiveEndDate`: date, optional
- `status`: enum — `active`, `inactive`
- `createdBy`: ObjectId, reference to `staffs`
- `createdAt`: date
- `updatedAt`: date

Indexes: `serviceType + vehicleCategory + powerType + status`; `effectiveStartDate + effectiveEndDate`.

### Collection 23: `fare_quotes`

Store the price offered to the sender so that later fare-rule changes do not silently alter an existing quote.

- `_id`: ObjectId
- `senderId`: ObjectId, reference to `users`
- `deliveryOrderId`: ObjectId, optional reference to `delivery_orders`
- `fareRuleId`: ObjectId, reference to `fare_rules`
- `distanceKm`: number
- `estimatedWeightKg`: number
- `baseFee`: Decimal128
- `distanceFee`: Decimal128
- `weightFee`: Decimal128
- `handlingFee`: Decimal128
- `discountAmount`: Decimal128
- `taxAmount`: Decimal128
- `totalFee`: Decimal128
- `currency`: string — `ETB`
- `expiresAt`: date
- `acceptedAt`: date, optional
- `createdAt`: date

Indexes: `senderId + createdAt`; `expiresAt`.

### Collection 24: `service_zones`

- `_id`: ObjectId
- `zoneName`: string
- `description`: string, optional
- `boundary`: GeoJSON Polygon or MultiPolygon
- `minimumDeliveryFee`: Decimal128
- `maximumServiceDistanceKm`: number
- `maxWeightKg`: number
- `allowedPackageCategories`: array of strings
- `hasCODSupport`: boolean
- `serviceType`: enum — `delivery`
- `currency`: string — `ETB`
- `status`: enum — `active`, `inactive`
- `createdAt`: date
- `updatedAt`: date

Indexes: `2dsphere` on `boundary`; `status`; unique `zoneName`.

### Collection 25: `promotions`

- `_id`: ObjectId
- `code`: string
- `description`: string
- `discountType`: enum — `fixed`, `percentage`
- `discountValue`: Decimal128
- `maxDiscount`: Decimal128, optional
- `minimumDeliveryFee`: Decimal128
- `currency`: string — `ETB`
- `validFrom`: date
- `validTo`: date
- `usageLimit`: number, optional
- `perUserLimit`: number, optional
- `status`: enum — `active`, `inactive`, `expired`
- `createdBy`: ObjectId, reference to `users`
- `createdAt`: date
- `updatedAt`: date

Indexes: unique normalized `code`; `status + validFrom + validTo`.

For limited promotions, add a `promotion_redemptions` collection with `promotionId`, `userId`, `deliveryOrderId`, `discountAmount`, and `redeemedAt`. Enforce usage limits atomically.

## 8. Wallets, deposits, service fees, and payments

### Collection 26: `wallets`

- `_id`: ObjectId
- `userId`: ObjectId, reference to `users`
- `walletType`: enum — `driver`, `sender`, `platform`
- `currency`: string — `ETB`
- `availableBalance`: Decimal128
- `reservedBalance`: Decimal128
- `status`: enum — `active`, `frozen`, `closed`
- `version`: number, default `0`
- `createdAt`: date
- `updatedAt`: date

Indexes: unique `userId + walletType + currency`; `status`.

Only create wallets for applicable user and platform accounts. For stronger accounting, treat the ledger as the source of truth and reconcile cached balances.

### Collection 27: `transactions`

The financial ledger. Never delete or silently edit completed transactions.

- `_id`: ObjectId
- `transactionNumber`: string, unique
- `walletId`: ObjectId, reference to `wallets`
- `userId`: ObjectId, optional reference to `users`
- `transactionType`: enum — `deposit`, `withdrawal`, `delivery_payment`, `service_fee`, `refund`, `adjustment`, `cash_collection`, `return_fee`, `weight_surcharge`, `settlement`, `wallet_reservation`, `wallet_release`
- `amount`: Decimal128
- `currency`: string — `ETB`
- `direction`: enum — `debit`, `credit`
- `referenceType`: string
- `referenceId`: ObjectId
- `relatedTransactionId`: ObjectId, optional reference to `transactions`
- `status`: enum — `pending`, `completed`, `failed`, `reversed`
- `description`: string, optional
- `idempotencyKey`: string
- `createdBy`: ObjectId, optional reference to `users`
- `createdAt`: date

Indexes: unique `transactionNumber`; unique scoped idempotency key; `walletId + createdAt`; `referenceType + referenceId`; `userId + createdAt`.

For production-grade accounting, add a `journal_entries` collection with a `journalId`, `accountId`, `debitAmount`, `creditAmount`, `currency`, `referenceType`, `referenceId`, and `createdAt`. Each posted journal must balance: total debits equal total credits for each currency.

### Collection 28: `driver_deposits`

- `_id`: ObjectId
- `driverId`: ObjectId, reference to `drivers`
- `walletTransactionId`: ObjectId, optional reference to `transactions`
- `amount`: Decimal128
- `currency`: string — `ETB`
- `paymentMethod`: enum — `cash`, `bank_transfer`, `mobile_money`, `other`
- `paymentReference`: string, optional
- `depositProofUrl`: string, optional
- `verificationStatus`: enum — `pending`, `verified`, `rejected`
- `verifiedBy`: ObjectId, optional reference to `staffs`
- `verifiedAt`: date, optional
- `rejectionReason`: string, optional
- `createdAt`: date
- `updatedAt`: date

Indexes: `driverId + verificationStatus`; `paymentReference`.

Do not treat a pending deposit as available money. Require verified funds before enabling deliveries when your deposit policy applies.

### Collection 29: `service_fees`

- `_id`: ObjectId
- `deliveryId`: ObjectId, reference to `deliveries`
- `deliveryOrderId`: ObjectId, reference to `delivery_orders`
- `driverId`: ObjectId, reference to `drivers`
- `grossDeliveryFee`: Decimal128
- `serviceFeePercentage`: number
- `serviceFeeAmount`: Decimal128
- `currency`: string — `ETB`
- `paymentSource`: enum — `driver_wallet`, `sender_payment`, `cash_settlement`
- `deductionStatus`: enum — `pending`, `deducted`, `failed`, `reversed`
- `transactionId`: ObjectId, optional reference to `transactions`
- `deductedAt`: date, optional
- `createdAt`: date
- `updatedAt`: date

Indexes: unique `deliveryId`; `driverId + deductionStatus`; `createdAt`.

Deduct a service fee only once for the applicable completed delivery. Make fee calculation and ledger posting idempotent.

### Collection 30: `cod_payments`

Cash on delivery must be tracked separately from ordinary wallet transactions.

- `_id`: ObjectId
- `deliveryId`: ObjectId, reference to `deliveries`
- `deliveryOrderId`: ObjectId, reference to `delivery_orders`
- `driverId`: ObjectId, reference to `drivers`
- `senderId`: ObjectId, reference to `users`
- `expectedAmount`: Decimal128
- `collectedAmount`: Decimal128
- `outstandingAmount`: Decimal128
- `currency`: string — `ETB`
- `collectionStatus`: enum — `pending`, `partially_collected`, `collected`, `verified`, `disputed`
- `collectedAt`: date, optional
- `verifiedBy`: ObjectId, optional reference to `staffs`
- `verifiedAt`: date, optional
- `settlementTransactionId`: ObjectId, optional reference to `transactions`
- `idempotencyKey`: string
- `createdAt`: date
- `updatedAt`: date

Indexes: unique `deliveryId`; unique scoped idempotency key; `driverId + collectionStatus`.

Define explicitly whether COD is money collected from the recipient for the goods, the delivery fee, or both. Those amounts may belong to different parties and must not be mixed in settlement calculations.

### Collection 31: `refunds`

- `_id`: ObjectId
- `deliveryId`: ObjectId, optional reference to `deliveries`
- `deliveryOrderId`: ObjectId, reference to `delivery_orders`
- `userId`: ObjectId, reference to `users`
- `originalTransactionId`: ObjectId, reference to `transactions`
- `refundAmount`: Decimal128
- `currency`: string — `ETB`
- `refundReason`: string
- `refundMethod`: enum — `cash`, `bank_transfer`, `mobile_money`, `wallet`
- `refundStatus`: enum — `pending`, `approved`, `rejected`, `processed`, `failed`
- `approvedBy`: ObjectId, optional reference to `staffs`
- `processedAt`: date, optional
- `refundTransactionId`: ObjectId, optional reference to `transactions`
- `idempotencyKey`: string
- `createdAt`: date
- `updatedAt`: date

Indexes: `deliveryOrderId`; `userId + refundStatus`; unique scoped idempotency key.

### Collection 32: `driver_settlements`

- `_id`: ObjectId
- `driverId`: ObjectId, reference to `drivers`
- `periodStart`: date
- `periodEnd`: date
- `grossDeliveryEarnings`: Decimal128
- `serviceFees`: Decimal128
- `codCollected`: Decimal128
- `cashRemitted`: Decimal128
- `adjustments`: Decimal128
- `netPayable`: Decimal128
- `currency`: string — `ETB`
- `status`: enum — `pending`, `calculated`, `approved`, `paid`, `disputed`, `cancelled`
- `approvedBy`: ObjectId, optional reference to `staffs`
- `paidAt`: date, optional
- `paymentReference`: string, optional
- `createdAt`: date
- `updatedAt`: date

Indexes: `driverId + periodStart + periodEnd`; `status + createdAt`.

If a settlement covers multiple deliveries, maintain a `driver_settlement_items` collection with `settlementId`, `deliveryId`, `transactionId`, `itemType`, and `amount` so the calculation is auditable.

## 9. Admin operations, reviews, and notifications

### Collection 33: `reviews`

- `_id`: ObjectId
- `deliveryId`: ObjectId, reference to `deliveries`
- `deliveryOrderId`: ObjectId, reference to `delivery_orders`
- `senderId`: ObjectId, reference to `users`
- `driverId`: ObjectId, reference to `drivers`
- `rating`: number — integer from 1 to 5
- `comment`: string, optional
- `reviewStatus`: enum — `published`, `hidden`, `under_review`
- `moderatedBy`: ObjectId, optional reference to `staffs`
- `createdAt`: date
- `updatedAt`: date

Indexes: unique `deliveryId + senderId`; `driverId + createdAt`; `reviewStatus + createdAt`.

### Collection 34: `user_devices`

- `_id`: ObjectId
- `userId`: ObjectId, reference to `users`
- `deviceToken`: string
- `platform`: enum — `android`, `ios`, `web`
- `provider`: enum — `fcm`, `expo`
- `lastSeenAt`: date
- `createdAt`: date
- `updatedAt`: date

Indexes: unique `deviceToken`; `userId + platform`.

### Collection 35: `audit_logs`

- `_id`: ObjectId
- `userId`: ObjectId, optional reference to `users`
- `actorRole`: string
- `action`: string
- `entityName`: string
- `entityId`: ObjectId
- `previousValues`: object, optional
- `newValues`: object, optional
- `ipAddress`: string, optional
- `userAgent`: string, optional
- `requestId`: string, optional
- `createdAt`: date

Indexes: `entityName + entityId + createdAt`; `userId + createdAt`; `action + createdAt`.

Never log passwords, OTPs, authorization tokens, or unnecessary full identity information. Protect audit records from ordinary edits and deletions.

### Collection 36: `outbox_events`

Used to reliably publish notifications and other background events after a database transaction succeeds.

- `_id`: ObjectId
- `eventType`: string
- `aggregateType`: string
- `aggregateId`: ObjectId
- `payload`: object
- `status`: enum — `pending`, `processing`, `processed`, `failed`
- `retryCount`: number
- `availableAt`: date
- `lastError`: string, optional
- `lastErrorAt`: date, optional
- `createdAt`: date
- `processedAt`: date, optional

Indexes: `status + availableAt`; `aggregateType + aggregateId`; `eventType + createdAt`.

The event publisher should use retries, leases or processing locks, and idempotent consumers to avoid duplicate effects.

### Collection 37: `promotion_redemptions`

- `_id`: ObjectId
- `promotionId`: ObjectId, reference to `promotions`
- `userId`: ObjectId, reference to `users`
- `deliveryOrderId`: ObjectId, reference to `delivery_orders`
- `discountAmount`: Decimal128
- `currency`: string — `ETB`
- `status`: enum — `reserved`, `redeemed`, `released`
- `redeemedAt`: date, optional
- `createdAt`: date

Indexes: `promotionId + userId`; unique `deliveryOrderId + promotionId`.

Use a transaction to reserve and redeem promotional usage so concurrent requests cannot exceed the limit.

## Collection 38: `notification_deliveries`

Use this additional collection to track delivery attempts for each channel. One notification might succeed through push but fail through SMS.

- `_id`: ObjectId
- `notificationId`: ObjectId, reference to `notifications`
- `recipientUserId`: ObjectId, reference to `users`
- `channel`: enum — `in_app`, `push`, `sms`, `email`
- `provider`: enum — `expo`, `fcm`, `sms_gateway`, `email_provider`, `internal`
- `providerMessageId`: string, optional
- `deliveryStatus`: enum — `pending`, `processing`, `sent`, `delivered`, `failed`, `cancelled`
- `attemptCount`: number, default `0`
- `maxAttempts`: number, default `3`
- `nextRetryAt`: date, optional
- `sentAt`: date, optional
- `deliveredAt`: date, optional
- `failedAt`: date, optional
- `lastError`: string, optional
- `createdAt`: date
- `updatedAt`: date

Indexes

- `{ notificationId: 1, channel: 1 }` — unique if you maintain one delivery record per channel
- `{ deliveryStatus: 1, nextRetryAt: 1 }` — background retry worker
- `{ recipientUserId: 1, createdAt: 1 }`
- `{ providerMessageId: 1 }` — sparse or partial index