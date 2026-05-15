pipeline {
    agent any

    triggers {
        pollSCM('* * * * *')
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Build Docker Image') {
            steps {
                sh 'docker build -t devops-nginx-app:latest .'
            }
        }

        stage('Prepare Deploy Directory') {
            steps {
                sh '''
                    rm -rf /opt/devops-nginx-cicd/*
                    cp -r . /opt/devops-nginx-cicd/
                '''
            }
        }

        stage('Deploy Containers') {
            steps {
                dir('/opt/devops-nginx-cicd') {
                    sh 'docker compose up -d --force-recreate'
                }
            }
        }

        stage('Test App') {
            steps {
                sh 'curl -f http://localhost || exit 1'
            }
        }
    }
}
