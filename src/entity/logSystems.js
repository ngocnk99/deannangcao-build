import mongoose, { Types } from "mongoose";

const Schema = mongoose.Schema;

const description = {
  title: {
    type: String,
  },
  describe: String,
};

const content = new Schema({
  title: {
    type: String,
  },
  shortTitle: {
    type: String,
  },
  content: {
    type: String,
  },
});

const logs = new Schema({
  name: {
    type: String,
    min: 5,
    required: [true, "Cần trường tên"],
    $exist: true,
    validate: {
      validator: function (v) {
        return /^(?=^(?!( *$)))/i.test(v);
      },
      message: (props) => `${props.value} is not a valid name`,
    },
    unique: true,
  },
  _name: String,
  images: [String],
  description: String,
  // description: description,
  // informations: [String],
  contents: [content],
  diseases: [
    {
      type: Schema.Types.ObjectId,
      ref: "diseases",
    },
  ],
  status: Boolean,
  hashTags: [String],
  urlSlug : {
    type :String,
    unique : true
  }
},{ timestamps: {createdAt: 'createdAt', updatedAt: 'updatedAt' }});

const logs = mongoose.model("logs", logs);

export default logs;
