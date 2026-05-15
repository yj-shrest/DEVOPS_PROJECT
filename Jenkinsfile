pipeline {
    agent any

    triggers {
        pollSCM('* * * * *')
    }

    environment {
        DEPLOY_DIR = '/home/jenkins/devops-nginx-cicd'
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
                    mkdir -p "$DEPLOY_DIR"
                    rm -rf "$DEPLOY_DIR"/*
                    cp -r . "$DEPLOY_DIR"/
                    ls -l "$DEPLOY_DIR/monitoring/prometheus.yml"
                '''
            }
        }

        stage('Deploy Containers') {
            steps {
                sh '''
                    cd "$DEPLOY_DIR"
                    docker compose down --remove-orphans || true
                    docker compose up -d --force-recreate
                '''
            }
        }

        stage('Test App') {
            steps {
                sh 'curl -f http://localhost || exit 1'
            }
        }
    }
}
