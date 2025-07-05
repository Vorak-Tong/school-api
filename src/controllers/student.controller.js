import db from '../models/index.js';

/**
 * @swagger
 * tags:
 *   name: Students
 *   description: Student management
 */

/**
 * @swagger
 * /students:
 *   post:
 *     summary: Create a new student
 *     tags: [Students]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, email]
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *     responses:
 *       201:
 *         description: Student created
 */

export const createStudent = async (req, res) => {
    try {
        const student = await db.Student.create(req.body);
        res.status(201).json(student);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

/**
 * @swagger
 * /students:
 *   get:
 *     summary: Get all students
 *     tags: [Students]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 10 }
 *         description: Number of items per page
 *       - in: query
 *         name: sort
 *         schema: { type: string, enum: [asc, desc], default: desc }
 *         description: Sort order by creation date
 *       - in: query
 *         name: populate
 *         schema: { type: string }
 *         description: Include related data (courses)
 *     responses:
 *       200:
 *         description: List of students with pagination metadata
 */

export const getAllStudents = async (req, res) => {
    try {
        // Pagination
        const limit = parseInt(req.query.limit) || 10;
        const page = parseInt(req.query.page) || 1;
        const offset = (page - 1) * limit;

        // Sorting
        const sort = req.query.sort === 'asc' ? 'ASC' : 'DESC';

        // Eager loading
        const populate = req.query.populate;
        let includeOptions = [];

        if(populate){
            const populateArray = populate.split(',');
            if(populateArray.includes('courses')){
                includeOptions.push(db.Course);
            }
        }

        // Get total count for pagination
        const total = await db.Student.count();

        const students = await db.Student.findAll({
            include: includeOptions,
            limit: limit,
            offset: offset,
            order: [['createdAt', sort]]
        });

        res.json({
            meta: {
                totalItems: total,
                page: page,
                totalPages: Math.ceil(total / limit),
                limit: limit,
                sort: sort.toLowerCase()
            },
            data: students
        });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

/**
 * @swagger
 * /students/{id}:
 *   get:
 *     summary: Get a student by ID
 *     tags: [Students]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema: { type: integer }
 *       - in: query
 *         name: populate
 *         schema: { type: string }
 *         description: Include related data (courses)
 *     responses:
 *       200:
 *         description: A student
 *       404:
 *         description: Not found
 */

export const getStudentById = async (req, res) => {
    try {
        // eager loading
        const populate = req.query.populate;
        let includeOptions = [];

        if(populate){
            const populateArray = populate.split(',');
            if(populateArray.includes('courses')){
                includeOptions.push(db.Course);
            }
        }

        const student = await db.Student.findByPk(req.params.id, {
            include: includeOptions
        });

        if(!student) return res.status(404).json({ message: 'Not found' });
        res.json(student);

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

/**
 * @swagger
 * /students/{id}:
 *   put:
 *     summary: Update a student
 *     tags: [Students]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema: { type: integer }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: 
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *     responses:
 *       200:
 *         description: Updated
 *       404:
 *         description: Not found
 */

export const updateStudent = async (req, res) => {
    try {
        const student = await db.Student.findByPk(req.params.id);
        if (!student) return res.status(404).json({ message: 'Not found' });
        await student.update(req.body);
        res.json(student);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

/**
 * @swagger
 * /students/{id}:
 *   delete:
 *     summary: Delete a student
 *     tags: [Students]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Deleted
 *       404:
 *         description: Not found
 */
export const deleteStudent = async (req, res) => {
    try {
        const student = await db.Student.findByPk(req.params.id);
        if (!student) return res.status(404).json({ message: 'Not found' });
        await student.destroy();
        res.json({ message: 'Deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
