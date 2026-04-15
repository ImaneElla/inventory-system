#!/bin/bash
set -e

mvn clean package -DskipTests

exec java -jar target/inventory-system-0.0.1-SNAPSHOT.jar
