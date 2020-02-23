# PlutoraBitbucketWebHookReciever
This is a receiever of requests are being triggered by Bitbucket Web Hooks.
For autotransition Jira issue to PrApproved or Merged state with changing assignee to QA.

To make it working:
1. Deploy the app to the cloud (lambda, heroku, and etc) 
2. Add WebHook to bitbucket repo
    * for pr_approved - {{your_app_url}}/pr_approved - trigger on Pull Request Approved
    * for merged - {{your_app_url}}/merged - trigger on Repository Push
3. Generate Token for user performing the action via Jira API - https://confluence.atlassian.com/cloud/api-tokens-938839638.html and add to config.js
User performing action should have perms for update status of Jira issues and change assignee.
