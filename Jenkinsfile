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
		    rm -rf "$DEPLOY_DIR"/*
                    mkdir -p "$DEPLOY_DIR/nginx"
                    mkdir -p "$DEPLOY_DIR/monitoring"


                    cp Dockerfile "$DEPLOY_DIR"/
                    cp index.html "$DEPLOY_DIR"/
                    cp Jenkinsfile "$DEPLOY_DIR"/

                    if [ -f docker-compose.yml ]; then
                        cp docker-compose.yml "$DEPLOY_DIR"/
                    else
                        cp docker-compose.yaml "$DEPLOY_DIR"/
                    fi

                    cp nginx/default.conf "$DEPLOY_DIR/nginx"/
                    cp monitoring/prometheus.yml "$DEPLOY_DIR/monitoring"/
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
