import { Box, Button, Flex, Grid, GridItem, Heading, Text } from "@chakra-ui/react";
import Card from "components/card/Card";
import { HSeparator } from "components/separator/Separator";
import Spinner from "components/spinner/Spinner";
import moment from "moment";
import { useEffect, useState } from "react";
import { IoIosArrowBack } from "react-icons/io";
import { Link, useNavigate, useParams } from "react-router-dom";
import { HasAccess } from "../../../redux/accessUtils";
import { getApi } from "services/api";
import { DeleteIcon } from "@chakra-ui/icons";
import { deleteApi } from "services/api";
import CommonDeleteModel from "components/commonDeleteModel";
import { FaFilePdf } from "react-icons/fa";
import html2pdf from "html2pdf.js";

const View = () => {
  const param = useParams();
  const [data, setData] = useState(null);
  const [deleteMany, setDeleteMany] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isPDFLoading, setPDFLoading] = useState(false);
  const [isInitialFetchDone, setIsInitialFetchDone] = useState(false);
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));
  const [permission, contactAccess, leadAccess] = HasAccess([
    "Meetings",
    "Contacts",
    "Leads"
  ]);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const response = await getApi("api/meeting/view/", param.id);
      setData(response?.data);
    } catch (error) {
      console.error("Failed to fetch meeting details", error);
    } finally {
      setIsLoading(false);
      setIsInitialFetchDone(true);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (isInitialFetchDone && !data) {
      navigate(-1);
    }
  }, [isInitialFetchDone, data, navigate]);


  console.log('user', user)

  const generatePDF = () => {
    const element = document.getElementById("reports");
    const hideBtn = document.getElementById("hide-btn");
    if (!element) return;
    hideBtn.style.display = "none";
    setPDFLoading(true);

    html2pdf()
      .from(element)
      .set({
        margin: 0,
        filename: `Meeting_Details_${moment().format("DD-MM-YYYY")}.pdf`,
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true, allowTaint: true },
        jsPDF: { unit: "in", format: "letter", orientation: "portrait" }
      })
      .save()
      .finally(() => {
        hideBtn.style.display = "";
        setPDFLoading(false);
      });
  };

  const handleDeleteMeeting = async () => {
    try {
      setIsLoading(true);
      const response = await deleteApi("api/meeting/delete/", param.id);
      if (response.status === 200) {
        setDeleteMany(false);
        navigate(-1);
      }
    } catch (error) {
      console.error("Error deleting meeting", error);
    } finally {
      setIsLoading(false);
    }
  };

  const renderAttendees = () => {
    const attendees = data?.meeting?.related === "Contact" ? data?.meeting?.attendes : data?.meeting?.attendesLead;
    if (!attendees || attendees.length === 0) return "-";

    return attendees.map((item) => {
      const label = data.related === "Contact" ? `${item.firstName} ${item.lastName}` : item.leadName;
      const path = data.related === "Contact" ? `/contactView/${item._id}` : `/leadView/${item._id}`;

      const hasAccess =
        (data.related === "Contact" && contactAccess?.view) ||
        (data.related === "Lead" && leadAccess?.view);

      return hasAccess ? (
        <Link key={item._id} to={path}>
          <Text color="brand.600" _hover={{ color: "blue.500", textDecoration: "underline" }}>{label}</Text>
        </Link>
      ) : (
        <Text key={item._id} color="blackAlpha.900">{label}</Text>
      );
    });
  };

  return (
    <>
      {isLoading ? (
        <Flex justifyContent="center" alignItems="center" width="100%">
          <Spinner />
        </Flex>
      ) : (
        <Grid templateColumns="repeat(4, 1fr)" gap={3} id="reports">
          <GridItem colSpan={4}>
            <Heading size="lg" m={3}>{data?.meeting?.agenda || ""}</Heading>
          </GridItem>
          <GridItem colSpan={4}>
            <Card>
              <Grid gap={4}>
                <GridItem colSpan={2}>
                  <Flex justifyContent="space-between">
                    <Heading size="md" mb={3}>Meeting Details</Heading>
                    <Box id="hide-btn">
                      <Button
                        leftIcon={<FaFilePdf />}
                        size="sm"
                        variant="brand"
                        onClick={generatePDF}
                        disabled={isPDFLoading}
                      >
                        {isPDFLoading ? "Please Wait..." : "Print as PDF"}
                      </Button>
                      <Button
                        leftIcon={<IoIosArrowBack />}
                        size="sm"
                        variant="brand"
                        onClick={() => navigate(-1)}
                        ml={2}
                      >
                        Back
                      </Button>
                    </Box>
                  </Flex>
                  <HSeparator />
                </GridItem>
                <GridItem colSpan={2}><Text fontWeight="bold">Agenda</Text><Text>{data?.meeting?.agenda || "-"}</Text></GridItem>
                <GridItem colSpan={2}><Text fontWeight="bold">Created By</Text><Text>{data?.meeting?.createdByName || "-"}</Text></GridItem>
                <GridItem colSpan={2}><Text fontWeight="bold">DateTime</Text><Text>{data?.meeting?.dateTime ? moment(data.dateTime).format("DD-MM-YYYY h:mma") : "-"}</Text></GridItem>
                <GridItem colSpan={2}><Text fontWeight="bold">Timestamp</Text><Text>{data?.meeting?.timestamp ? moment(data.timestamp).format("DD-MM-YYYY h:mma") : "-"}</Text></GridItem>
                <GridItem colSpan={2}><Text fontWeight="bold">Location</Text><Text>{data?.meeting?.location || "-"}</Text></GridItem>
                <GridItem colSpan={2}><Text fontWeight="bold">Notes</Text><Text>{data?.meeting?.notes || "-"}</Text></GridItem>
                <GridItem colSpan={2}><Text fontWeight="bold">Attendees</Text>{renderAttendees()}</GridItem>
              </Grid>
            </Card>
          </GridItem>
        </Grid>
      )}

      {(user?.role === 'superAdmin' || permission?.delete) && (
        <Card mt={3}>
          <Grid templateColumns="repeat(6, 1fr)" gap={1}>
            <GridItem colStart={6}>
              <Flex justifyContent="flex-end">
                <Button
                  size="sm"
                  bg="red.800"
                  onClick={() => setDeleteMany(true)}
                  leftIcon={<DeleteIcon />}
                  colorScheme="red"
                >
                  Delete
                </Button>
              </Flex>
            </GridItem>
          </Grid>
        </Card>
      )}

      <CommonDeleteModel
        isOpen={deleteMany}
        onClose={() => setDeleteMany(false)}
        type="Meetings"
        handleDeleteData={handleDeleteMeeting}
        ids={param.id}
      />
    </>
  );
};

export default View;
