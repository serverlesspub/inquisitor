SHELL=/bin/sh
CWD := $(shell pwd)
STACK_NAME=responsive-sls-test
DEPLOYMENT_BUCKET=$(STACK_NAME)-deployment-$(AWS_REGION)
include .env


output.yml: template.yml sync-test-function/lambda.js
	aws cloudformation package --template-file $< --output-template-file $@ \
		--s3-bucket $(DEPLOYMENT_BUCKET) --region $(AWS_REGION) --profile $(AWS_PROFILE)

deployment-bucket: 
	aws s3api create-bucket --region $(AWS_REGION) --profile $(AWS_PROFILE) \
		--bucket $(DEPLOYMENT_BUCKET) \
		--create-bucket-configuration LocationConstraint=$(AWS_REGION)

deploy: output.yml
	aws cloudformation deploy --capabilities CAPABILITY_IAM CAPABILITY_AUTO_EXPAND \
	--template-file $< \
	--stack-name $(STACK_NAME) --region $(AWS_REGION) --profile $(AWS_PROFILE)
	#--parameter-overrides $(STACK_NAME)


logs:
	sam logs --stack-name $(STACK_NAME) -n SyncTestFunction \
		--region $(AWS_REGION) --profile $(AWS_PROFILE)

web-config.yml: output.yml
	aws cloudformation  describe-stacks \
		--stack-name $(STACK_NAME) --region $(AWS_REGION) --profile $(AWS_PROFILE) \
		--query Stacks[].Outputs[] --output text | awk '//{print $$1 ": " $$2}' > $@

node_modules/aws-sdk/dist/aws-sdk.min.js:
	npm install

jekyll/vendor/aws-sdk.min.js: node_modules/aws-sdk/dist/aws-sdk.min.js
	mkdir -p jekyll/vendor
	cp $< $@

web: web-config.yml jekyll/vendor/aws-sdk.min.js
	jekyll serve -s jekyll -c $<

clean:
	rm -f output.yml web-config.yml
	aws cloudformation delete-stack \
		--stack-name $(STACK_NAME) --region $(AWS_REGION) --profile $(AWS_PROFILE)

.PHONY: deploy deployment-bucket clean logs web

