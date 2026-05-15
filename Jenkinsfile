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

        stage('Deploy Containers') {
            steps {
                sh 'docker compose up -d --force-recreate --no-deps app'
                sh 'docker compose up -d prometheus grafana nginx-exporter'
            }
        }

        stage('Test App') {
            steps {
                sh 'curl -f http://localhost || exit 1'
            }
        }
    }
}
