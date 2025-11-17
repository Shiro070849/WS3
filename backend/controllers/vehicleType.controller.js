const vehicleTypeService = require('../service/vehicleType.service');

class VehicleTypeController {
  /**
   * GET /api/vehicle-types
   * ดึงรายการประเภทรถทั้งหมด
   */
  async getAll(req, res) {
    try {
      const activeOnly = req.query.activeOnly !== 'false'; // default true
      const vehicleTypes = await vehicleTypeService.getAllVehicleTypes(activeOnly);

      res.status(200).json({
        success: true,
        data: vehicleTypes,
      });
    } catch (error) {
      console.error('Error in getAll vehicle types:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching vehicle types',
        error: error.message,
      });
    }
  }

  /**
   * GET /api/vehicle-types/:id
   * ดึงข้อมูลประเภทรถตาม ID
   */
  async getById(req, res) {
    try {
      const { id } = req.params;
      const vehicleType = await vehicleTypeService.getVehicleTypeById(id);

      if (!vehicleType) {
        return res.status(404).json({
          success: false,
          message: 'Vehicle type not found',
        });
      }

      res.status(200).json({
        success: true,
        data: vehicleType,
      });
    } catch (error) {
      console.error('Error in getById vehicle type:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching vehicle type',
        error: error.message,
      });
    }
  }

  /**
   * POST /api/vehicle-types
   * สร้างประเภทรถใหม่
   */
  async create(req, res) {
    try {
      const { localName, englishName, description, isActive, order } = req.body;

      // Validation
      if (!localName) {
        return res.status(400).json({
          success: false,
          message: 'Local name is required',
        });
      }

      // ตรวจสอบชื่อซ้ำ
      const isDuplicate = await vehicleTypeService.checkDuplicateName(localName);
      if (isDuplicate) {
        return res.status(400).json({
          success: false,
          message: 'Vehicle type name already exists',
        });
      }

      const data = {
        localName,
        englishName,
        description,
        isActive,
        order,
      };

      const result = await vehicleTypeService.createVehicleType(data);

      res.status(201).json({
        success: true,
        message: 'Vehicle type created successfully',
        data: result,
      });
    } catch (error) {
      console.error('Error in create vehicle type:', error);
      res.status(500).json({
        success: false,
        message: 'Error creating vehicle type',
        error: error.message,
      });
    }
  }

  /**
   * PUT /api/vehicle-types/:id
   * แก้ไขข้อมูลประเภทรถ
   */
  async update(req, res) {
    try {
      const { id } = req.params;
      const { localName, englishName, description, isActive, order } = req.body;

      // Validation
      if (!localName) {
        return res.status(400).json({
          success: false,
          message: 'Local name is required',
        });
      }

      // ตรวจสอบว่ามีอยู่จริง
      const existing = await vehicleTypeService.getVehicleTypeById(id);
      if (!existing) {
        return res.status(404).json({
          success: false,
          message: 'Vehicle type not found',
        });
      }

      // ตรวจสอบชื่อซ้ำ (ยกเว้นตัวเอง)
      const isDuplicate = await vehicleTypeService.checkDuplicateName(localName, id);
      if (isDuplicate) {
        return res.status(400).json({
          success: false,
          message: 'Vehicle type name already exists',
        });
      }

      const data = {
        localName,
        englishName,
        description,
        isActive,
        order,
      };

      const result = await vehicleTypeService.updateVehicleType(id, data);

      res.status(200).json({
        success: true,
        message: 'Vehicle type updated successfully',
        data: result,
      });
    } catch (error) {
      console.error('Error in update vehicle type:', error);
      res.status(500).json({
        success: false,
        message: 'Error updating vehicle type',
        error: error.message,
      });
    }
  }

  /**
   * DELETE /api/vehicle-types/:id
   * ลบประเภทรถ
   */
  async delete(req, res) {
    try {
      const { id } = req.params;

      // ตรวจสอบว่ามีอยู่จริง
      const existing = await vehicleTypeService.getVehicleTypeById(id);
      if (!existing) {
        return res.status(404).json({
          success: false,
          message: 'Vehicle type not found',
        });
      }

      const result = await vehicleTypeService.deleteVehicleType(id);

      res.status(200).json({
        success: true,
        message: result.message,
        type: result.type,
      });
    } catch (error) {
      console.error('Error in delete vehicle type:', error);
      res.status(500).json({
        success: false,
        message: 'Error deleting vehicle type',
        error: error.message,
      });
    }
  }
}

module.exports = new VehicleTypeController();
