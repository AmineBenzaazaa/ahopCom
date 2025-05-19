import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  Flex,
  FormLabel,
  Grid,
  GridItem,
  IconButton,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Radio,
  RadioGroup,
  Stack,
  Text,
  Textarea,
  useToast,
} from "@chakra-ui/react";
import { CUIAutoComplete } from "chakra-ui-autocomplete";
import MultiContactModel from "components/commonTableModel/MultiContactModel";
import MultiLeadModel from "components/commonTableModel/MultiLeadModel";
import Spinner from "components/spinner/Spinner";
import dayjs from "dayjs";
import { useFormik } from "formik";
import { LiaMousePointerSolid } from "react-icons/lia";
import { MeetingSchema } from "schema";
import { getApi, postApi } from "services/api";
import { useDispatch } from "react-redux";
import { fetchMeetingData } from "../../../../redux/slices/meetingSlice";

const Addmeeting = ({ onClose, isOpen, setAction, leadContect, id }) => {
  const [contactData, setContactData] = useState([]);
  const [leadData, setLeadData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [contactModelOpen, setContactModel] = useState(false);
  const [leadModelOpen, setLeadModel] = useState(false);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const toast = useToast();
  const dispatch = useDispatch();

  // Fetch contacts & leads once
  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [cRes, lRes] = await Promise.all([
          getApi("api/contact"),
          getApi("api/lead"),
        ]);
        setContactData(cRes.data || []);
        setLeadData(lRes.data || []);
      } catch (err) {
        console.error(err);
        toast({ status: "error", title: "Failed to fetch contact or lead data" });
      }
    };
    fetchAll();
  }, [toast]);

  // Reset submission flag when modal closes
  useEffect(() => {
    if (!isOpen) setFormSubmitted(false);
  }, [isOpen]);

  // Formik setup
  const formik = useFormik({
    initialValues: {
      agenda: "",
      attendees: leadContect === "contactView" && id ? [id] : [],
      leadAttendees: leadContect === "leadView" && id ? [id] : [],
      location: "",
      related:
        leadContect === "contactView"
          ? "Contact"
          : leadContect === "leadView"
          ? "Lead"
          : "None",
      dateTime: "",
      notes: "",
    },
    validationSchema: MeetingSchema,
    onSubmit: async (values, { resetForm }) => {
      if (formSubmitted) return;
      setFormSubmitted(true);
      setIsLoading(true);

      // Payload matches your server schema exactly
      const payload = {
        agenda: values.agenda,
        attendees: values.related === "Contact" ? values.attendees : [],
        leadAttendees: values.related === "Lead" ? values.leadAttendees : [],
        location: values.location,
        related: values.related,
        dateTime: values.dateTime,
        notes: values.notes,
        createdBy: JSON.parse(localStorage.getItem("user"))?._id,
      };

      try {
        const res = await postApi("api/meeting", payload);
        console.log('res', res)
        // Accept any 2xx (201 included)
        if (res.status >= 201 && res.status < 300) {
          await dispatch(fetchMeetingData());
          setAction((prev) => !prev);
          resetForm();
          onClose();
        } else {
          throw new Error(`Unexpected status ${res.status}`);
        }
      } catch (error) {
        console.error(error);
        setFormSubmitted(false);
      } finally {
        setIsLoading(false);
      }
    },
  });

  const {
    values,
    errors,
    touched,
    handleChange,
    handleBlur,
    handleSubmit,
    setFieldValue,
    resetForm,
    isValid,
    dirty,
  } = formik;

  // Build autocomplete options
  const attendeeOptions = (
    values.related === "Contact" ? contactData : leadData
  ).map((item) => ({
    value: item._id,
    label:
      values.related === "Contact"
        ? `${item.firstName} ${item.lastName}`
        : item.leadName,
  }));

  return (
    <Modal onClose={onClose} isOpen={isOpen} isCentered size="lg">
      <ModalOverlay />
      <ModalContent maxH="90vh">
        <ModalHeader>Add Meeting</ModalHeader>
        <ModalCloseButton />
        <ModalBody overflowY="auto">
          <MultiContactModel
            data={contactData}
            isOpen={contactModelOpen}
            onClose={setContactModel}
            fieldName="attendees"
            setFieldValue={setFieldValue}
          />
          <MultiLeadModel
            data={leadData}
            isOpen={leadModelOpen}
            onClose={setLeadModel}
            fieldName="leadAttendees"
            setFieldValue={setFieldValue}
          />

          <Grid templateColumns="repeat(12, 1fr)" gap={4}>
            {/* Agenda */}
            <GridItem colSpan={12}>
              <FormLabel>
                Agenda <Text as="span" color="red">*</Text>
              </FormLabel>
              <Input
                name="agenda"
                value={values.agenda}
                onChange={handleChange}
                onBlur={handleBlur}
                borderColor={errors.agenda && touched.agenda ? "red.300" : undefined}
              />
              {errors.agenda && touched.agenda && (
                <Text color="red.500" fontSize="sm">
                  {errors.agenda}
                </Text>
              )}
            </GridItem>

            {/* Related To */}
            <GridItem colSpan={12}>
              <FormLabel>
                Related To <Text as="span" color="red">*</Text>
              </FormLabel>
              <RadioGroup
                value={values.related}
                onChange={(val) => setFieldValue("related", val)}
              >
                <Stack direction="row">
                  {leadContect !== "leadView" && <Radio value="Contact">Contact</Radio>}
                  {leadContect !== "contactView" && <Radio value="Lead">Lead</Radio>}
                </Stack>
              </RadioGroup>
              {errors.related && touched.related && (
                <Text color="red.500" fontSize="sm">
                  {errors.related}
                </Text>
              )}
            </GridItem>

            {/* Attendees Autocomplete */}
            {attendeeOptions.length > 0 && (
              <GridItem colSpan={12}>
                <Flex align="flex-end" gap={2}>
                  <Box flex="1">
                    <CUIAutoComplete
                      label={`Select ${values.related}`}
                      placeholder="Type a name…"
                      items={attendeeOptions}
                      selectedItems={attendeeOptions.filter((opt) =>
                        values.related === "Contact"
                          ? values.attendees.includes(opt.value)
                          : values.leadAttendees.includes(opt.value)
                      )}
                      onSelectedItemsChange={({ selectedItems }) => {
                        const ids = selectedItems.map((i) => i.value);
                        setFieldValue(
                          values.related === "Contact" ? "attendees" : "leadAttendees",
                          ids
                        );
                      }}
                    />
                  </Box>
                  <IconButton
                    mb={6}
                    aria-label="Open picker"
                    icon={<LiaMousePointerSolid />}
                    onClick={() =>
                      values.related === "Contact"
                        ? setContactModel(true)
                        : setLeadModel(true)
                    }
                  />
                </Flex>
              </GridItem>
            )}

            {/* Location */}
            <GridItem colSpan={12}>
              <FormLabel>Location</FormLabel>
              <Input
                name="location"
                value={values.location}
                onChange={handleChange}
                onBlur={handleBlur}
                borderColor={errors.location && touched.location ? "red.300" : undefined}
              />
              {errors.location && touched.location && (
                <Text color="red.500" fontSize="sm">
                  {errors.location}
                </Text>
              )}
            </GridItem>

            {/* DateTime */}
            <GridItem colSpan={12}>
              <FormLabel>
                Date &amp; Time <Text as="span" color="red">*</Text>
              </FormLabel>
              <Input
                type="datetime-local"
                name="dateTime"
                min={dayjs().format("YYYY-MM-DDTHH:mm")}
                value={values.dateTime}
                onChange={handleChange}
                onBlur={handleBlur}
                borderColor={errors.dateTime && touched.dateTime ? "red.300" : undefined}
              />
              {errors.dateTime && touched.dateTime && (
                <Text color="red.500" fontSize="sm">
                  {errors.dateTime}
                </Text>
              )}
            </GridItem>

            {/* Notes */}
            <GridItem colSpan={12}>
              <FormLabel>Notes</FormLabel>
              <Textarea
                name="notes"
                value={values.notes}
                onChange={handleChange}
                onBlur={handleBlur}
                resize="none"
                borderColor={errors.notes && touched.notes ? "red.300" : undefined}
              />
              {errors.notes && touched.notes && (
                <Text color="red.500" fontSize="sm">
                  {errors.notes}
                </Text>
              )}
            </GridItem>
          </Grid>
        </ModalBody>

        <ModalFooter>
          <Button
            colorScheme="blue"
            mr={3}
            onClick={handleSubmit}
            isLoading={isLoading}
            disabled={!dirty || !isValid || formSubmitted}
          >
            Save
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              resetForm();
              onClose();
            }}
          >
            Cancel
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default Addmeeting;