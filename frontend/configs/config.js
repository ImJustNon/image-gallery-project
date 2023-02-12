module.exports = {
    database: {
        postgreSQL: {
            user: 'nondeklnw',
            host: 'dpg-cek2d6da4991ihg4gn8g-a.singapore-postgres.render.com',
            database: 'upload_web',
            password: 'nXPnh95QnSQeyC9y1w1uFjjUntbLJzPf',
            port: 5432,
            application_name: "upload_web", 
            ssl: true,
        }
    },
    app: {
        address: '127.0.0.1',
        port: 8888,
    },
    api: {
        server: 'http://45.141.26.136:8800',
    },
}