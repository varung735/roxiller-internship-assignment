require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const collection = mongoose.connection.collection('data');

const app = express();

const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

//middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// since we are operating on sales data received by DB. Let's have a function called GetSales from DB
const getSales = async (month) => {
    try {
        const monthIndex = monthNames.indexOf(month) + 1;

        const sales = await collection.find({
            $expr: {
                $eq: [{ $month: { $dateFromString: { dateString: "$dateOfSale" } } }, monthIndex]
            }
        }).toArray();

        return sales;
    } catch (error) {
        console.log(error);
    }
};

const salesAnayltics = (sales) => {

    const analytics = {
        amount: 0,
        soldItems: 0,
        unSoldItems: 0
    }

    const saleAmount = sales.filter(sales => sales.sold).reduce((amount, sales) => amount + sales.price, 0);
    const soldItemsCount = sales.filter(sales => sales.sold).length;
    const notSoldItemsCount = sales.filter(sales => sales.sold === false).length;

    analytics.amount = saleAmount;
    analytics.soldItems = soldItemsCount;
    analytics.unSoldItems = notSoldItemsCount;

    return analytics;
};

const getRangeData = (sales) => {
    const ranges = [
        { startsAt: 0, endsAt: 100, rangeName: "0-100", saleObject: [] },
        { startsAt: 101, endsAt: 200, rangeName: "101-200", saleObject: [] },
        { startsAt: 201, endsAt: 300, rangeName: "201-300", saleObject: [] },
        { startsAt: 301, endsAt: 400, rangeName: "301-400", saleObject: [] },
        { startsAt: 401, endsAt: 500, rangeName: "401-500", saleObject: [] },
        { startsAt: 501, endsAt: 600, rangeName: "501-600", saleObject: [] },
        { startsAt: 601, endsAt: 700, rangeName: "601-700", saleObject: [] },
        { startsAt: 701, endsAt: 800, rangeName: "701-800", saleObject: [] },
        { startsAt: 801, endsAt: 900, rangeName: "801-900", saleObject: [] },
        { startsAt: 901, endsAt: Infinity, rangeName: "901-greater", saleObject: [] },
    ];

    parsedSalesObject = JSON.parse(JSON.stringify(sales));

    parsedSalesObject.forEach(sale => {
        ranges.forEach(range => {
            if (sale.price > range.startsAt && sale.price < range.endsAt) {
                range.saleObject.push(sale);
            }
        });
    });

    return {
        zeroToHundred: ranges[0].saleObject.length,
        hundredToTwo: ranges[1].saleObject.length,
        twoHundredToThree: ranges[2].saleObject.length,
        threeHundredToFour: ranges[3].saleObject.length,
        fourHundredToFive: ranges[4].saleObject.length,
        fiveHundredToSix: ranges[5].saleObject.length,
        sixHundredToSeven: ranges[6].saleObject.length,
        sevenHundredToEight: ranges[7].saleObject.length,
        eightHundredToNine: ranges[8].saleObject.length,
        nineHundredToInfinity: ranges[9].saleObject.length
    };
};

const getCategoryWiseData = (sales) => {
    const categories = [];

    sales.forEach(sale => {
        categories.push(sale.category);
    });

    const categoryWiseData = categories.reduce((count, category) => {
        count[category] = (count[category] || 0) + 1;
        return count;
    }, {});

    return categoryWiseData;
}

app.get('/getMonthlyAnalytics', async (req, res) => {
    try {
        const { month } = req.body;

        const sales = await getSales(month);

        const monthlyAnalytics = salesAnayltics(sales);

        res.status(200).json({
            success: true,
            message: "Got Monthly Analytics Successfully",
            analytics: monthlyAnalytics
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            message: "Cannot Get Monthly Analytics",
            error: error.message
        });
    }
});

app.get('/getBarChartData', async (req, res) => {
    try {
        let { month } = req.body;
        
        const sales = await getSales(month);

        const rangeAnalytics = getRangeData(sales);

        res.status(200).json({
            success: true,
            message: "Got Bar Chart Data Successfully",
            rangeAnalytics: rangeAnalytics
        });


    } catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            message: "Cannot Get Bar chart data",
            error: error.message
        });
    }
});

app.get('/getCategoryWiseData', async (req, res) => {
    try {
        const { month } = req.body;
        
        const sales = await getSales(month);

        const categoryWiseData = getCategoryWiseData(sales);

        res.status(200).json({
            success: true,
            message: "Got Category Wise Data Successfully",
            categoryWiseData: categoryWiseData
        });
        
    } catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            message: "Cannot Get Category Wise Data",
            error: error.message
        });
    }
});

app.get('/completeAnalytics', async (req, res) => {
    try {
        const { month } = req.body;
    
        const sales = await getSales(month);
    
        const monthlyAnalytics = salesAnayltics(sales);
        const rangeData = getRangeData(sales);
        const categoryWiseData = getCategoryWiseData(sales);
    
        res.status(200).json({
            success: true,
            message: "Fetched Data Successfully",
            analytics: monthlyAnalytics,
            ranges: rangeData,
            categories: categoryWiseData
        });
        
    } catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            message: "Cannot Get Data",
            error: error.message
        });
    }
})

module.exports = app;