# **Birth & Death Module – Technical Documentation**
## **1. Overview**
This module handles the registration of births, deaths, and mortuary records within the hospital system. It manages records, issues certificates, provides analytics for trends and compliance, and integrates with Hodo Core patient data.
## **2. Database Schema**
Main tables:

- ParentData — Stores parent details
- birthRecords — Stores birth registration details
- deathRecords — Stores death registration details
- mortuaryRecords — Stores mortuary registration details
## **3. Table Structure Needed for the Module**
### **ParentData Table**

|Field|Type|Description|
| :- | :- | :- |
|BID\_PK|BIGINT|Primary Key|
|BID\_FK|BIGINT|Foreign Key|
|id|string|Unique Parent ID|
|firstName|string|Parent’s first name|
|lastName|string|Parent’s last name|
|gender|string|Gender|
|dateOfBirth|date|Date of Birth (YYYY-MM-DD)|
|mobileNo|string|Mobile number|
|email|string|Email address|
|term|string|Term of pregnancy|
|deliveryType|string|Delivery type|
|uhid|string|UHID|
|civilIds|string|Civil ID|
|nationality|string|Nationality|
|doctor|string|Doctor’s name|
|bloodGroup|string|Blood group|
|Added\_By|string|Name of Person Added|
|Added\_on|datetime|Date & Time of Adding|
|Modified\_By|string|Name of Person Modified|
|Modified\_on|datetime|Date & Time of Modification|
|Status|boolean|Registered or not|
|Provider\_FK|BIGINT|Foreign Key|

### **birthRecords Table**

|Field|Type|Description|
| :- | :- | :- |
|BID\_PK|BIGINT|Primary Key|
|BID\_FK|BIGINT|Foreign Key|
|id|string|Unique Birth Record ID|
|ParentDataId|string|FK to ParentData.id|
|firstName|string|Baby’s first name|
|lastName|string|Baby’s last name|
|gender|string|Gender|
|placeOfBirth|string|Place of birth|
|dateOfBirth|date|Date of birth (YYYY-MM-DD)|
|motherName|string|Mother’s name|
|fatherName|string|Father’s name|
|birthTime|string|Time of birth (HH:MM)|
|length|number|Length (cm)|
|headCircumference|number|Head circumference (cm)|
|weight|number|Weight (kg)|
|term|string|Term (Full Term / Pre Term)|
|deliveryType|string|Delivery type|
|status|string|Status (Checked In, etc.)|
|xrayId|string|X-Ray ID|
|registeredBy|string|Who registered|
|registeredOn|datetime|When registered|
|registeredAt|string|Registration location|
|qrData|JSON string|QR Data in JSON format|
|email|string|Email of parent|
|mobileNo|string|Mobile number of parent|
|uhid|string|UHID|
|bloodGroup|string|Blood group|
|nationality|string|Nationality|
|Added\_By|string|Name of Person Added|
|Added\_on|datetime|Date & Time of Adding|
|Modified\_By|string|Name of Person Modified|
|Modified\_on|datetime|Date & Time of Modification|
|Status|boolean|Registered or not|
|Provider\_FK|BIGINT|Foreign Key|

### **deathRecords Table**

|Field|Type|Description|
| :- | :- | :- |
|BID\_PK|BIGINT|Primary Key|
|BID\_FK|BIGINT|Foreign Key|
|id|string|Unique Death Record ID|
|firstName|string|Deceased’s first name|
|lastName|string|Deceased’s last name|
|dateOfBirth|date|Date of Birth|
|mobileNo|string|Mobile number|
|doctorName|string|Doctor’s name|
|ipNo|string|IP number|
|dateOfDeath|date|Date of Death|
|gender|string|Gender|
|causeOfDeath|string|Cause of death|
|causeOfDeathType|string|Type of cause|
|postmortemDone|string|Yes/No|
|pathologistName|string|Pathologist’s name|
|placeOfDeath|string|Place of death|
|deathInformedPerson|string|Informant’s name|
|deathInformedContact|string|Informant’s contact|
|deathInformedAddress|string|Informant’s address|
|relatives|array|List of relatives|
|registeredBy|string|Who registered|
|registeredOn|datetime|When registered|
|registeredAt|string|Registration location|
|age|number|Age at death|
|Added\_By|string|Name of Person Added|
|Added\_on|datetime|Date & Time of Adding|
|Modified\_By|string|Name of Person Modified|
|Modified\_on|datetime|Date & Time of Modification|
|Status|boolean|Registered or not|
|Provider\_FK|BIGINT|Foreign Key|

### **mortuaryRecords Table**

|Field|Type|Description|
| :- | :- | :- |
|BID\_PK|BIGINT|Primary Key|
|BID\_FK|BIGINT|Foreign Key|
|id|string|Unique ID|
|firstName|string|First name|
|lastName|string|Last name|
|dateOfBirth|date|Date of Birth|
|mobileNo|string|Mobile number|
|doctorName|string|Doctor’s name|
|ipNo|string|IP number|
|dateOfDeath|date|Date of Death|
|gender|string|Gender|
|causeOfDeath|string|Cause of death|
|causeOfDeathType|string|Type of cause|
|postmortemDone|string|Yes/No|
|pathologistName|string|Pathologist’s name|
|placeOfDeath|string|Place of death|
|deathInformedPerson|string|Informant’s name|
|deathInformedContact|string|Informant’s contact|
|deathInformedAddress|string|Informant’s address|
|relatives|array|List of relatives|
|registeredBy|string|Who registered|
|registeredOn|datetime|When registered|
|registeredAt|string|Registration location|
|age|number|Age at death|
|Added\_By|string|Name of Person Added|
|Added\_on|datetime|Date & Time of Adding|
|Modified\_By|string|Name of Person Modified|
|Modified\_on|datetime|Date & Time of Modification|
|Status|boolean|Registered or not|
|Provider\_FK|BIGINT|Foreign Key|

## **4. Special Data Needed by the Frontend for Workflows**
Dashboard: Requires aggregated statistics (e.g., total births, deaths, registrations, certificates).\
Recent Activities: Needs a merged, sorted list from Parent, Birth, Death, and Mortuary records.
## **5. CRUD API Endpoints**
- ParentData
- GET /ParentData — List all
- POST /ParentData — Create new
- GET /ParentData/:id — Get by ID
- PUT /ParentData/:id — Update by ID
- DELETE /ParentData/:id — Delete by ID
- birthRecords
- GET /birthRecords — List all
- POST /birthRecords — Create new
- GET /birthRecords/:id — Get by ID
- PUT /birthRecords/:id — Update by ID
- DELETE /birthRecords/:id — Delete by ID
- deathRecords
- GET /deathRecords — List all
- POST /deathRecords — Create new
- GET /deathRecords/:id — Get by ID
- PUT /deathRecords/:id — Update by ID
- DELETE /deathRecords/:id — Delete by ID
- mortuaryRecords
- GET /mortuaryRecords — List all
- POST /mortuaryRecords — Create new
- GET /mortuaryRecords/:id — Get by ID
- PUT /mortuaryRecords/:id — Update by ID
- DELETE /mortuaryRecords/:id — Delete by ID
## **6. Special Data Endpoints**
Dashboard/Statistics: GET /statistics — Returns aggregate counts.

Recent Activities: GET /activities/recent — Returns merged list of activities.

Certificates: GET /certificates?type=birth|death — Certificate data for printing.
## **7. Request and Response JSON Examples**
Example: Create Birth Record

***Request:***

{\
`  `"firstName": "John",\
`  `"lastName": "Doe",\
`  `"dateOfBirth": "2023-01-01",\
`  `"gender": "male",\
`  `"placeOfBirth": "City Hospital"\
}

***Response:***

{\
`  `"id": "1",\
`  `"firstName": "John",\
`  `"...": "..."\
}
## **8. Impact of This Change in Overall System**
\- Dashboard widgets\
\- Registration modules\
\- Certificate generation and printing\
\- Recent activities feed\
Ensure integration with Hodo core modules without disrupting billing, EMR, etc.
## **9. Module Activation/Deactivation and Integration**
Activation: Enable via admin/config panel, register endpoints and sync tables.\
Deactivation: Hide UI, disable endpoints, retain data for audit/history.\
Integration: Use Hodo’s APIs and user/session management gracefully.
## **10. System Testing**
\- Unit Tests: All API endpoints\
\- Integration Tests: Workflows involving multiple tables/modules\
\- End-to-End Tests: User flows\
\- Regression Tests: Ensure no adverse impact
