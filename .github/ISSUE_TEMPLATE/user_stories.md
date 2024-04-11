---
name: User Stories
about: Use this template for user stories submission
title: "C3 Phase 1: User Stories"
labels: []
assignees: ""
---

Make sure to follow the *Role, Goal, Benefit* framework for the user stories and the *Given/When/Then* framework for the Definitions of Done! For the DoDs, think about both success and failure scenarios. You can also refer to the examples DoDs in [C3 spec](https://sites.google.com/view/ubc-cpsc310-22w1/project/checkpoint-3#h.8c0lkthf1uae).

## User Story 1
As a science student, I want to choose some courses taught by my favorite professor in some department I am interested in, 
so that I can register the interesting courses taught by that professor.


#### Definitions of Done(s)
Scenario 1: Professor name in correct format and department also in correct format,  
Given: The student is on our webpage<br>
When: the student enters the professor name in the professor field with the format first name 
in the beginning and last name at the end, and the student enters the correct format department name
in the department field, which is the valid abbreviation name of the subject, (e.g. "atsc" or "math").<br>
Then: our application displays the detail information of the courses that instructor taught, in the descending order by
year.

Scenario 2: Professor name in correct format and department in the wrong format,  
Given: The student is on our webpage<br>
When: the student enters the professor name in the professor field with the correct format first name
in the beginning and last name at the end, and the student enters the wrong format of department name
in the department field, which is not valid abbreviation name of the subject, like the all upper cases
department name and the incorrect abbreviation of that department name(e.g. "CPSC" or "CPS").<br>
Then: our application will display the error message in red saying that the department input is wrong.

Scenario 3: Professor name in wrong format and department in the correct format,  
Given: The student is on our webpage<br>
When: the student enters the professor name in the professor field with invalid format such as last name in the beginning
and first name at the end, or only the first name of the professor(e.g "George")
and the student enters the correct format of department name in the department field,
which is the valid abbreviation name of the subject, (e.g. "atsc" or "math").<br>
Then: our application will display the error message in red saying that the professor input is wrong.


Scenario 4: Professor name in wrong format and department also in the wrong format,  
Given: The student is on our webpage<br>
When: the student enters the professor name in the professor field with invalid format such as last name in the beginning
and first name at the end, or only the first name of the professor(e.g "George")
and the student enters the wrong format of department name
in the department field, which is not valid abbreviation name of the subject, like the all upper cases
department name and the incorrect abbreviation of that department name(e.g. "CPSC" or "CPS").<br>
Then: our application will display the error message in red saying that the professor input is wrong and the department
input is wrong.


## User Story 2
As a science student, I want to choose some courses with higher average than other courses, so that I can take these courses 
which have grades higher than my input average.


#### Definitions of Done(s)
Scenario 1: average in the correct format
Given: The student is on our webpage<br>
When: The student enters the course average in the grade field with correct format like a number between 1 and 99(e.g. 89,97)<br>
Then: our application will display all the courses with average higher than this number with course details with descending order by
 average.<br>


Scenario 2: average in the invalid format
Given: The student is on our webpage<br>
When: The student enters the course average in the grade field with invalid format like if it consists of any non-number character (e.g. "8t9","eighty nine")<br>
Then: our application will display the error message saying that the average input is invalid.


Scenario 3: average with empty input
Given: The student is on our webpage<br>
When: The student doesn't enter anything in the input field<br>
Then: our application will respond to this based on the size of the database.If the database is not too large, then it will display
all the courses with average by descending order in average.But if the database is too large, then it will display the error message
that the result is tooLarge and it wouldn't display anything on the webpage.<br>

## Others
You may provide any additional user stories + DoDs in this section for general TA feedback.  
But these will not be graded.
