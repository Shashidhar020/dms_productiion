

import outletService from './outlet.service.js'

const getOutlets = async (req, res) => {
    try {  
     

        const result = await outletService.getOutlets(
            req.scope
        );

        return res.status(200).json({
            success: true,
            message: 'Outlets fetched successfully',
            ...result
        });

    } catch (error) {
        console.error('GET Outlets ERROR:', error);

        return res.status(500).json({
            success: false,
            message: 'Failed to fetch Outlets',
            error: error.message
        });
    }
};

export default { getOutlets }