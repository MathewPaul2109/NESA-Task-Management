---
description: Rule regarding the task limit when fetching tasks on the frontend
---

# Frontend Task Limits

- We intentionally keep the task limit to `10` on the frontend for now.
- **Do not** fetch `1000` tasks or change the limit to a massive number just to calculate task progress on the frontend. If a higher limit is needed in the future to correctly calculate project progress percentages when tasks exceed 10, implement the task progress calculation on the backend instead.
