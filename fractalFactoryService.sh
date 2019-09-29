#!/bin/bash
# chkconfig: 35 20 80
# description: Starts the Fractal Factory service

# this file is to be placed in the /etc/rc.d/init.d/ directory
# so it will run as a service:
#  start: service fractalFactoryService start
#   stop: service fractalFactoryService stop
# reload: service fractalFactoryService reload
# status: service fractalFactoryService status

# Source function library.
. /etc/init.d/functions
#
# Define paths and parameters here


export APP_HOME=/opt/fractalFactory
export PID_FILE=${APP_HOME}/fractalFactory.pid
export LOG_PATH=${APP_HOME}
export LOG_FILE=${LOG_PATH}/fractalFactory.log
export PORT=1338
export LOG_LEVEL=DEBUG
# look for all node processees that have fractalFactory in the result
export PIDSTRING=$(ps -fC node | grep fractalFactory)
export FRACTALNAME="Fractal Factory Service"


start() {
    echo "Starting $FRACTALNAME..."
    if [ -f ${PID_FILE} ]; then
        if [ ! -z "${PIDSTRING}" ]
            then
                echo $FRACTALNAME is already running.
                exit 1
            else
                rm ${PID_FILE}
        fi
    fi
    npm install --prefix ${APP_HOME}
    node ${APP_HOME}/server/fractalFactory.js logFile=${LOG_FILE} logLevel=${LOG_LEVEL} port=${PORT} > /dev/null &
    echo $! > ${PID_FILE}
	# Continue for 90 seconds to check whether the service has completed starting.
	timer=90
	while [ $timer -gt 0 ]; do
		logTail=$(tail -1 ${LOG_FILE} | grep "fractalFactory is running on port "${PORT})
		if [ "$logTail" != "" ]; then
			let timer=-1
		else
			sleep 1
			let timer=timer-1
		fi
	done
    if [ $timer -eq 0 ]; then
        echo "*** WARNING exceeded startup time $FRACTALNAME may not have started."
    else
        echo "$FRACTALNAME started - $(date)."
    fi
}

stop() {
    if [ -f ${PID_FILE} ]; then
        echo "Stopping $FRACTALNAME."
        kill `cat $PID_FILE`
# loop and wait to make sure the process has exited
        iFractal=4
        while [ $iFractal -gt 0 ]; do
            export PIDSTRING=$(ps -fC node | grep fractalFactory)
            if [ ! -z "${PIDSTRING}" ]; then
                sleep 1
                let iFractal=iFractal-1
            else
                let iFractal=-1
            fi
        done
        if [ $iFractal -eq 0 ]; then
            echo "*** Warning $FRACTALNAME may not be stopped."
        else
            rm -f ${PID_FILE}
            echo "$FRACTALNAME stopped."
        fi
    else
        echo "PID file is missing, $FRACTALNAME may already be stopped."
    fi
}

case "$1" in
    start)
        start
        ;;
    stop)
        stop
        ;;
    restart)
        stop
        start
        ;;
    reload)
        stop
        start
        ;;
    status)
         if [ ! -z "${PIDSTRING}" ]; then
             echo $PIDSTRING
         else
             echo "$FRACTALNAME is stopped."
       fi
       ;;
    *)
       echo "Usage: $0 {start|stop|status|restart|reload}"
esac

exit 0
