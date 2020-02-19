make output-us-east-1.yml AWS_PROFILE=desole AWS_REGION=us-east-1 DEPLOYMENT_BUCKET=desole-packaging
sam publish -t output-us-east-1.yml --profile desole
