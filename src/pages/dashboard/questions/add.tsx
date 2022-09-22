import React, { useState } from "react";
import Head from "next/head";
import NextLink from "next/link";
import { useRouter } from "next/router";
import { useFormik } from "formik";
import * as yup from "yup";
import { toast } from "react-toastify";
import Container from "@mui/material/Container";
import Grid from "@mui/material/Unstable_Grid2";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import FormHelperText from "@mui/material/FormHelperText";
import Select from "@mui/material/Select";
import FormControlLabel from "@mui/material/FormControlLabel";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Breadcrumbs from "@mui/material/Breadcrumbs";
import IconButton from "@mui/material/IconButton";
import LoadingButton from "@mui/lab/LoadingButton";
import HomeIcon from "@mui/icons-material/Home";
import Box from "@mui/material/Box";
import { NextPageWithLayout } from "@/pages/_app";
import Link from "@/components/Link";
import DashboardLayout from "@/layouts/DashboardLayout";
import { trpc } from "@/utils/trpc";
import { Android12Switch } from "@/components/CustomComponents";
import { OPTION } from "@prisma/client";

interface QuestionForm {
  code: string;
  stem: string;
  published: boolean;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correctOption: OPTION;
}

const validationSchema = yup.object().shape({
  code: yup.string().min(2).max(100).required("Question Code is required"),
  stem: yup.string().min(2).max(100).required("Stem is required"),
  optionA: yup.string().min(1).max(100).required("Option A cannot be empty"),
  optionB: yup.string().min(1).max(100).required("Option B cannot be empty"),
  optionC: yup.string().min(1).max(100).required("Option C cannot be empty"),
  optionD: yup.string().min(1).max(100).required("Option D cannot be empty"),
  correctOption: yup
    .mixed()
    .oneOf([OPTION.A, OPTION.B, OPTION.C, OPTION.D])
    .required("Correct Option is required"),
  published: yup.boolean(),
});

const AddQuestion: NextPageWithLayout = () => {
  const [subjectId, setSubjectId] = useState<string>("");
  const [chapterId, setChapterId] = useState<string>("");
  const { data: subjects } = trpc.useQuery(["admin.subjects.list"]);
  const { data: chapters } = trpc.useQuery(["admin.chapters.list", subjectId], {
    enabled: !!subjectId,
    refetchOnWindowFocus: false,
  });
  const addQuestionMutation = trpc.useMutation("admin.questions.add", {
    onSuccess: (data) => {
      if (data) {
        toast.success(`${data.code} added!`);
      }
    },
    onError: (error) => {
      console.log(error.message);

      if (error.data?.code === "CONFLICT") {
        toast.error("Question with this code already exists");
        return;
      }
      if (error.data?.code === "BAD_REQUEST") {
        toast.error("Invalid form data");
        return;
      }
      toast.error("Something went wrong");
    },
  });
  const formik = useFormik<QuestionForm>({
    initialValues: {
      stem: "",
      code: "",
      published: true,
      optionA: "",
      optionB: "",
      optionC: "",
      optionD: "",
      correctOption: OPTION.A,
    },
    validationSchema,
    onSubmit: async (values, { resetForm }) => {
      console.log(values);
      if (!chapterId.length) {
        toast.warn("Select a chapter");
        return;
      }

      await addQuestionMutation
        .mutateAsync({ ...values, chapterId })
        .then(() => resetForm())
        .catch(() => {});
    },
  });

  return (
    <>
      <Head>
        <title>Add Question | Onushilonik Dashboard</title>
      </Head>
      <Container sx={{ mt: 2 }}>
        <Breadcrumbs sx={{ mb: 1, ml: -1 }} aria-label="breadcrumb">
          <NextLink href="/app" passHref>
            <IconButton component="a">
              <HomeIcon />
            </IconButton>
          </NextLink>
          <Link href="/dashboard" underline="hover" color="inherit">
            Dashboard
          </Link>
          <Link href="/dashboard/questions" underline="hover" color="inherit">
            Questions
          </Link>
          <Typography color="inherit">Add Question</Typography>
        </Breadcrumbs>
        <Typography gutterBottom variant="h4" sx={{ mb: 4 }}>
          Add Question
        </Typography>
        <Box
          component="form"
          onSubmit={formik.handleSubmit}
          sx={{ maxWidth: 600, pb: 10 }}
        >
          <Grid container spacing={2}>
            <Grid xs={12} md={6}>
              <FormControl sx={{ mb: 2 }} fullWidth>
                <InputLabel id="subject-select-label">
                  Select Subject
                </InputLabel>
                <Select
                  labelId="subject-select-label"
                  name="subjectId"
                  value={subjectId}
                  label="Select Subject"
                  onChange={(e) => setSubjectId(e.target.value as string)}
                >
                  <MenuItem value="" disabled>
                    Select an option
                  </MenuItem>
                  {subjects?.map((subject) => (
                    <MenuItem key={subject.id} value={subject.id}>
                      {subject.title}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid xs={12} md={6}>
              {chapters && (
                <FormControl sx={{ mb: 2 }} fullWidth>
                  <InputLabel id="chapter-select-label">
                    Select Chapter
                  </InputLabel>
                  <Select
                    labelId="chapter-select-label"
                    name="chapterId"
                    value={chapterId}
                    label="Select Chapter"
                    onChange={(e) => setChapterId(e.target.value as string)}
                  >
                    <MenuItem value="" disabled>
                      Select an option
                    </MenuItem>
                    {chapters?.map((chapter) => (
                      <MenuItem key={chapter.id} value={chapter.id}>
                        {chapter.title}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}
            </Grid>
          </Grid>
          <TextField
            label="Question Code"
            name="code"
            value={formik.values.code}
            onChange={formik.handleChange}
            fullWidth
            sx={{ mb: 2 }}
            error={formik.touched.code && !!formik.errors.code}
            helperText={formik.touched.code && formik.errors.code}
          />
          <TextField
            name="stem"
            label="Question"
            value={formik.values.stem}
            multiline
            rows={3}
            onChange={formik.handleChange}
            fullWidth
            sx={{ mb: 2 }}
            error={formik.touched.stem && !!formik.errors.stem}
            helperText={formik.touched.stem && formik.errors.stem}
          />
          <Grid container spacing={2}>
            <Grid xs={12} md={6}>
              <TextField
                name="optionA"
                label="Option A"
                value={formik.values.optionA}
                onChange={formik.handleChange}
                fullWidth
                sx={{ mb: 2 }}
                error={formik.touched.optionA && !!formik.errors.optionA}
                helperText={formik.touched.optionA && formik.errors.optionA}
              />
            </Grid>
            <Grid xs={12} md={6}>
              <TextField
                name="optionB"
                label="Option B"
                value={formik.values.optionB}
                onChange={formik.handleChange}
                fullWidth
                sx={{ mb: 2 }}
                error={formik.touched.optionB && !!formik.errors.optionB}
                helperText={formik.touched.optionB && formik.errors.optionB}
              />
            </Grid>
          </Grid>
          <Grid container spacing={2}>
            <Grid xs={12} md={6}>
              <TextField
                name="optionC"
                label="Option C"
                value={formik.values.optionC}
                onChange={formik.handleChange}
                fullWidth
                sx={{ mb: 2 }}
                error={formik.touched.optionC && !!formik.errors.optionC}
                helperText={formik.touched.optionC && formik.errors.optionC}
              />
            </Grid>
            <Grid xs={12} md={6}>
              <TextField
                name="optionD"
                label="Option D"
                value={formik.values.optionD}
                onChange={formik.handleChange}
                fullWidth
                sx={{ mb: 2 }}
                error={formik.touched.optionD && !!formik.errors.optionD}
                helperText={formik.touched.optionD && formik.errors.optionD}
              />
            </Grid>
          </Grid>
          <Grid container spacing={2}>
            <Grid xs={12} md={6}>
              <FormControl sx={{ mb: 2 }} fullWidth>
                <InputLabel id="option-select-label">Correct Option</InputLabel>
                <Select
                  labelId="option-select-label"
                  name="correctOption"
                  label="Correct Option"
                  value={formik.values.correctOption}
                  onChange={formik.handleChange}
                >
                  <MenuItem value="" disabled>
                    Select an option
                  </MenuItem>
                  {Object.values(OPTION).map((option) => (
                    <MenuItem value={option} key={option}>
                      {`Option ${option}`}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
          <Box sx={{ mb: 2 }}>
            <FormControlLabel
              control={<Android12Switch checked={formik.values.published} />}
              name="published"
              onChange={formik.handleChange}
              label="Publish"
            />
          </Box>

          <LoadingButton
            loading={addQuestionMutation.isLoading}
            variant="contained"
            type="submit"
            size="large"
          >
            Add Question
          </LoadingButton>
        </Box>
      </Container>
    </>
  );
};

AddQuestion.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default AddQuestion;
