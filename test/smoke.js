var expect = require('chai').expect;
var path = require('path');

var spark = require('../');

var DataFrame = require('../js/DataFrame');
var Row = require('../js/Row');


describe('Smoke test', function() {
    var df, sqlContext;

    this.timeout(10000);

    it('create sqlContext', function(done) {
        sqlContext= spark.sqlContext([], process.env.ASSEMBLY_JAR);
        done();
    })

    it('sqlContext.read().json() returns DataFrame', function(done) {
        var df = sqlContext.read().json(path.join(__dirname, "..", "data/people.json"));
        expect(df).to.be.an.instanceof(DataFrame);
        done();
    })

    it('sqlContext.read().collect() returns array of Rows with correct values', function(done) {
        var rows = sqlContext.read().json("./data/people.json").collect();

        expect(rows).to.be.an.instanceof(Array);

        rows.forEach(function (row) { expect(row).to.be.an.instanceof(Row);})

        var values = rows.map(function(row) { return row.values(); });
        expect(values).to.deep.equal([[null, 'Michael'], [30, 'Andy'], [19, 'Justin']]);

        done();
    })


    describe('Readme steps', function() {
        var df, sqlContext;

        it('create sqlContext', function(done) {
            sqlContext= spark.sqlContext([], process.env.ASSEMBLY_JAR);
            done();
        });

        it('var df = sqlContext.read().json("data/people.json");', function(done) {
            df = sqlContext.read().json(path.join(__dirname, "..", "data/people.json"));
            expect(df).to.be.an.instanceof(DataFrame);
            done();
        });

        it('df.show()', function(done) {
            var output = df.jvm_obj.showString(20, true).split("\n");
            /*
             +----+-------+
             | age|   name|
             +----+-------+
             |null|Michael|
             |  30|   Andy|
             |  19| Justin|
             +----+-------+
             */
            expect(output[1]).to.match(/.*age.*name.*/);
            expect(output[3]).to.match(/.*null.*Michael.*/);
            expect(output[4]).to.match(/.*30.*Andy.*/);
            expect(output[5]).to.match(/.*19.*Justin.*/);
            done();
        });

        it('df.printSchema()', function(done) {
            var output = df.jvm_obj.schema().treeString().split("\n");
            /*
             root
             |-- age: long (nullable = true)
             |-- name: string (nullable = true)
             */
            expect(output[1]).to.match(/.*age: long \(nullable = true\)/);
            expect(output[2]).to.match(/.*name: string \(nullable = true\)/);
            done();
        });

        it('df.select(df.col("name")).show()', function(done) {
            var output = df.select(df.col("name")).jvm_obj.showString(20, true).split("\n");
            /*
             +-------+
             |   name|
             +-------+
             |Michael|
             |   Andy|
             | Justin|
             +-------+
             */
            expect(output[3]).to.equal("|Michael|");
            done();
        });

        it('df.select("name").show()', function(done) {
            var output = df.select("name").jvm_obj.showString(20, true).split("\n");
            expect(output[5]).to.equal("| Justin|");
            done();
        });

        it('df.select(df.col("name"), df.col("age").plus(1)).show()', function(done) {
            var output = df.select(df.col("name"), df.col("age").plus(1)).jvm_obj.showString(20, true).split("\n");
            /*
             +-------+---------+
             |   name|(age + 1)|
             +-------+---------+
             |Michael|     null|
             |   Andy|       31|
             | Justin|       20|
             +-------+---------+
             */

            expect(output[3]).to.match(/.*Michael.*null.*/);
            expect(output[5]).to.match(/.*Justin.*20.*/);
            done();
        });

        it('df.filter(df.col("age").gt(21)).show()', function(done) {
            var output = df.filter(df.col("age").gt(21)).jvm_obj.showString(20, true).split("\n");
            /*
             +---+----+
             |age|name|
             +---+----+
             | 30|Andy|
             +---+----+
             */

            expect(output[3]).to.match(/.*30.*Andy.*/);
            done();
        });

        it('df.groupBy("age").count().show()', function(done) {
            var output = df.groupBy("age").count().jvm_obj.showString(20, true).split("\n");
            /*
             +----+-----+
             | age|count|
             +----+-----+
             |null|    1|
             |  19|    1|
             |  30|    1|
             +----+-----+
             */

            expect(output[3]).to.match(/.*null.*1.*/);
            expect(output[4]).to.match(/.*19.*1.*/);
            expect(output[5]).to.match(/.*30.*1.*/);
            done();
        });

    });


});
